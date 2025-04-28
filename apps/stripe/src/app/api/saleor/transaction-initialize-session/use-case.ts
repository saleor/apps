import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
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
import {
  createStripeClientSecret,
  StripeClientSecret,
  StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { mapStripeCreatePaymentIntentErrorToApiError } from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  parseTransactionInitializeSessionEventData,
  TransactionInitializeSessionEventData,
  TransactionInitializeSessionEventDataError,
} from "./event-data-parser";
import { resolvePaymentMethodFromEventData } from "./payment-method-resolver";
import {
  TransactionInitalizeSessionUseCaseResponses,
  TransactionInitalizeSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionInitalizeSessionUseCaseResponsesType,
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
    [SaleorMoney, StripePaymentIntentId, StripeClientSecret],
    | InstanceType<typeof StripePaymentIntentValidationError>
    | InstanceType<typeof SaleorMoney.ValidationError>
    | InstanceType<typeof StripeClientSecretValidationError>
  > {
    return Result.combine([
      SaleorMoney.createFromStripe({
        amount: stripePaymentIntentResponse.amount,
        currency: stripePaymentIntentResponse.currency,
      }),
      createStripePaymentIntentId(stripePaymentIntentResponse.id),
      createStripeClientSecret(stripePaymentIntentResponse.client_secret),
    ]);
  }

  private handleCreatePaymentIntentError(
    error: unknown,
    resolvedTransactionFlow: ResolvedTransationFlow,
    saleorEventAmount: number,
  ): UseCaseExecuteResult {
    const mappedError = mapStripeCreatePaymentIntentErrorToApiError(error);

    this.logger.error("Failed to create payment intent", { error: mappedError });

    if (resolvedTransactionFlow === "AUTHORIZATION") {
      return ok(
        new TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure({
          error: mappedError,
          saleorEventAmount: saleorEventAmount,
        }),
      );
    }

    return ok(
      new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        error: mappedError,
        saleorEventAmount: saleorEventAmount,
      }),
    );
  }

  private handleEventDataError(
    error: TransactionInitializeSessionEventDataError,
    saleorTransactionFlow: SaleorTransationFlow,
    saleorEventAmount: number,
  ): UseCaseExecuteResult {
    this.logger.error("Failed to parse event data", { error });

    if (saleorTransactionFlow === "AUTHORIZATION") {
      return ok(
        new TransactionInitalizeSessionUseCaseResponses.AuthorizationFailure({
          error,
          saleorEventAmount,
        }),
      );
    }

    return ok(
      new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        error,
        saleorEventAmount,
      }),
    );
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
      return this.handleEventDataError(
        eventDataResult.error,
        saleorTransactionFlow,
        event.action.amount,
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
      return this.handleCreatePaymentIntentError(
        createPaymentIntentResult.error,
        resolvedTransactionFlow,
        event.action.amount,
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

    const [saleorMoney, stripePaymentIntentId, stripeClientSecret] = mappedResponseResult.value;

    const recordResult = await this.transactionRecorder.recordTransaction(
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

    if (resolvedTransactionFlow === "AUTHORIZATION") {
      return ok(
        new TransactionInitalizeSessionUseCaseResponses.AuthorizationActionRequired({
          stripeClientSecret,
          saleorMoney,
          stripePaymentIntentId,
        }),
      );
    }

    return ok(
      new TransactionInitalizeSessionUseCaseResponses.ChargeActionRequired({
        stripeClientSecret,
        saleorMoney,
        stripePaymentIntentId,
      }),
    );
  }
}
