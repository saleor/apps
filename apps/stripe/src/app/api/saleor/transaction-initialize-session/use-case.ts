import { captureException } from "@sentry/nextjs";
import { err, fromThrowable, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createSaleorTransactionFlow,
  SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import {
  createStripeClientSecret,
  StripeClientSecret,
  StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  parseTransactionInitializeSessionEventData,
  TransactionInitializeSessionEventData,
} from "./event-data-parser";
import {
  TransactionInitializeAuthorizationFailureResult,
  TransactionInitializeChargeFailureResult,
} from "./failure-result";
import { resolvePaymentMethodFromEventData } from "./payment-method-resolver";
import {
  TransactionInitializeSessionUseCaseResponses,
  TransactionInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionInitializeSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  private transactionRecorder: TransactionRecorderRepo;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
    transactionRecorder: TransactionRecorderRepo;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
    this.transactionRecorder = deps.transactionRecorder;
  }

  private prepareStripeCreatePaymentIntentParams(args: {
    eventAction: TransactionInitializeSessionEventFragment["action"];
    eventData: TransactionInitializeSessionEventData;
    selectedPaymentMethodOptions: Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
  }): Result<Stripe.PaymentIntentCreateParams, InstanceType<typeof StripeMoney.ValdationError>> {
    return StripeMoney.createFromSaleorAmount({
      amount: args.eventAction.amount,
      currency: args.eventAction.currency,
    }).map((result) => {
      return {
        amount: result.amount,
        currency: result.currency,
        /*
         * Enable all payment methods configured in the Stripe Dashboard.
         * The app validated if it allow payment method before.
         */
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          ...args.selectedPaymentMethodOptions,
        },
      };
    });
  }

  private mapStripePaymentIntentToWebhookResponse(
    stripePaymentIntentResponse: Stripe.PaymentIntent,
  ): Result<
    [SaleorMoney, StripePaymentIntentId, StripeClientSecret, StripePaymentIntentStatus],
    InstanceType<
      | typeof StripePaymentIntentValidationError
      | typeof SaleorMoney.ValidationError
      | typeof StripeClientSecretValidationError
      | typeof StripePaymentIntentStatusValidationError
    >
  > {
    return Result.combine([
      SaleorMoney.createFromStripe({
        amount: stripePaymentIntentResponse.amount,
        currency: stripePaymentIntentResponse.currency,
      }),
      fromThrowable(createStripePaymentIntentId)(stripePaymentIntentResponse.id),
      createStripeClientSecret(stripePaymentIntentResponse.client_secret),
      createStripePaymentIntentStatus(stripePaymentIntentResponse.status),
    ]);
  }

  private resolveErrorTransactionResult(
    transactionFlow: ResolvedTransactionFlow | SaleorTransationFlow,
    event: TransactionInitializeSessionEventFragment,
  ): TransactionInitializeChargeFailureResult | TransactionInitializeAuthorizationFailureResult {
    if (transactionFlow === "AUTHORIZATION") {
      return new TransactionInitializeAuthorizationFailureResult({
        saleorEventAmount: event.action.amount,
      });
    }

    return new TransactionInitializeChargeFailureResult({
      saleorEventAmount: event.action.amount,
    });
  }

  private resolveOkTransactionResult({
    transactionFlow,
    stripeStatus,
    stripePaymentIntentId,
    stripeEnv,
  }: {
    transactionFlow: ResolvedTransactionFlow;
    stripeStatus: StripePaymentIntentStatus;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }): ChargeActionRequiredResult | AuthorizationActionRequiredResult {
    if (transactionFlow === "AUTHORIZATION") {
      return new AuthorizationActionRequiredResult({
        stripeStatus,
        stripePaymentIntentId,
        stripeEnv,
      });
    }

    return new ChargeActionRequiredResult({
      stripeStatus,
      stripePaymentIntentId,
      stripeEnv,
    });
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const saleorTransactionFlow = createSaleorTransactionFlow(event.action.actionType);

    const eventDataResult = parseTransactionInitializeSessionEventData(event.data);

    if (eventDataResult.isErr()) {
      this.logger.error("Failed to parse event data", { error: eventDataResult.error });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(saleorTransactionFlow, event),
          error: eventDataResult.error,
        }),
      );
    }

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: stripeConfigForThisChannel.error,
      });

      return err(new BrokenAppResponse());
    }

    if (!stripeConfigForThisChannel.value) {
      this.logger.warn("Config for channel not found", {
        channelId: event.sourceObject.channel.id,
      });

      return err(new AppIsNotConfiguredResponse());
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Creating Stripe payment intent with params", {
      params: args.event.action,
    });

    const selectedPaymentMethod = resolvePaymentMethodFromEventData(eventDataResult.value);

    const resolvedTransactionFlow =
      selectedPaymentMethod.getResolvedTransactionFlow(saleorTransactionFlow);

    const stripePaymentIntentParamsResult = this.prepareStripeCreatePaymentIntentParams({
      eventData: eventDataResult.value,
      eventAction: event.action,
      selectedPaymentMethodOptions:
        selectedPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow),
    });

    if (stripePaymentIntentParamsResult.isErr()) {
      captureException(stripePaymentIntentParamsResult.error);

      return err(new MalformedRequestResponse());
    }

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
      params: stripePaymentIntentParamsResult.value,
    });

    if (createPaymentIntentResult.isErr()) {
      const mappedError = mapStripeErrorToApiError(createPaymentIntentResult.error);

      this.logger.error("Failed to create payment intent", { error: mappedError });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(resolvedTransactionFlow, event),
          error: mappedError,
        }),
      );
    }

    const stripePaymentIntent = createPaymentIntentResult.value;

    this.logger.debug("Stripe created payment intent", { stripeResponse: stripePaymentIntent });

    const mappedResponseResult = this.mapStripePaymentIntentToWebhookResponse(stripePaymentIntent);

    if (mappedResponseResult.isErr()) {
      captureException(mappedResponseResult.error);
      this.logger.error("Failed to map Stripe Payment Intent to webhook response", {
        error: mappedResponseResult.error,
      });

      return err(new BrokenAppResponse());
    }

    const [saleorMoney, stripePaymentIntentId, stripeClientSecret, stripeStatus] =
      mappedResponseResult.value;

    const recordResult = await this.transactionRecorder.recordTransaction(
      {
        saleorApiUrl: args.saleorApiUrl,
        appId: args.appId,
      },
      new RecordedTransaction({
        saleorTransactionId: createSaleorTransactionId(event.transaction.id),
        stripePaymentIntentId,
        saleorTransactionFlow: saleorTransactionFlow,
        resolvedTransactionFlow: resolvedTransactionFlow,
        selectedPaymentMethod: selectedPaymentMethod.type,
      }),
    );

    if (recordResult.isErr()) {
      this.logger.error("Failed to record transaction", {
        error: recordResult.error,
      });

      return err(new BrokenAppResponse());
    }

    const transactionResult = this.resolveOkTransactionResult({
      transactionFlow: resolvedTransactionFlow,
      stripeStatus,
      stripePaymentIntentId,
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

    return ok(
      new TransactionInitializeSessionUseCaseResponses.Success({
        saleorMoney,
        transactionResult,
        stripeClientSecret,
      }),
    );
  }
}
