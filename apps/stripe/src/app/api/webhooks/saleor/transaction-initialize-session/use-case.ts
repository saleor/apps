import { SaleorSchemaVersion } from "@saleor/app-sdk/types";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, fromThrowable, ok, Result } from "neverthrow";
import Stripe from "stripe";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createSaleorTransactionFlow,
  SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import {
  createStripeClientSecret,
  StripeClientSecret,
  StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatus,
} from "@/modules/stripe/stripe-payment-intent-status";
import { CreatePaymentIntentArgs, IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  parseTransactionInitializeSessionEventData,
  TransactionInitializeSessionEventData,
} from "./event-data-parser";
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
    event: TransactionInitializeSessionEventFragment;
    eventData: TransactionInitializeSessionEventData;
    selectedPaymentMethodOptions: Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
    idempotencyKey: string;
  }): Result<CreatePaymentIntentArgs, InstanceType<typeof StripeMoney.ValdationError>> {
    return StripeMoney.createFromSaleorAmount({
      amount: args.event.action.amount,
      currency: args.event.action.currency,
    }).map((stripeMoney) => {
      return {
        metadata: {
          saleor_source_id: args.event.sourceObject.id,
          saleor_source_type: args.event.sourceObject.__typename,
          saleor_transaction_id: createSaleorTransactionId(args.event.transaction.id),
        },
        stripeMoney,
        idempotencyKey: args.idempotencyKey,
        intentParams: {
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
        },
      };
    });
  }

  private mapStripePaymentIntentToWebhookResponse(
    paymentIntent: Stripe.PaymentIntent,
  ): Result<
    [SaleorMoney, StripePaymentIntentId, StripeClientSecret, StripePaymentIntentStatus],
    InstanceType<
      | typeof StripePaymentIntentValidationError
      | typeof SaleorMoney.ValidationError
      | typeof StripeClientSecretValidationError
    >
  > {
    return Result.combine([
      resolveSaleorMoneyFromStripePaymentIntent(paymentIntent),
      fromThrowable(createStripePaymentIntentId)(paymentIntent.id),
      createStripeClientSecret(paymentIntent.client_secret),
      fromThrowable(createStripePaymentIntentStatus)(paymentIntent.status),
    ]);
  }

  private resolveErrorTransactionResult(
    transactionFlow: ResolvedTransactionFlow | SaleorTransationFlow,
  ): ChargeFailureResult | AuthorizationFailureResult {
    if (transactionFlow === "AUTHORIZATION") {
      return new AuthorizationFailureResult();
    }

    return new ChargeFailureResult();
  }

  private resolveOkTransactionResult({
    transactionFlow,
    stripeStatus,
  }: {
    transactionFlow: ResolvedTransactionFlow;
    stripeStatus: StripePaymentIntentStatus;
  }): ChargeActionRequiredResult | AuthorizationActionRequiredResult {
    if (transactionFlow === "AUTHORIZATION") {
      return new AuthorizationActionRequiredResult(stripeStatus);
    }

    return new ChargeActionRequiredResult(stripeStatus);
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionInitializeSessionEventFragment;
    saleorSchemaVersion: SaleorSchemaVersion;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event, saleorSchemaVersion } = args;

    const saleorTransactionFlow = createSaleorTransactionFlow(event.action.actionType);

    const eventDataResult = parseTransactionInitializeSessionEventData(event.data);

    if (eventDataResult.isErr()) {
      this.logger.warn("Failed to parse event data", { error: eventDataResult.error });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(saleorTransactionFlow),
          error: eventDataResult.error,
          appContext: appContextContainer.getContextValue(),
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

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          stripeConfigForThisChannel.error,
        ),
      );
    }

    if (!stripeConfigForThisChannel.value) {
      this.logger.warn("Config for channel not found", {
        channelId: event.sourceObject.channel.id,
      });

      return err(
        new AppIsNotConfiguredResponse(
          appContextContainer.getContextValue(),
          new BaseError("Config not found"),
        ),
      );
    }

    appContextContainer.set({
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

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
      event: event,
      selectedPaymentMethodOptions:
        selectedPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow),
      idempotencyKey: event.idempotencyKey,
    });

    if (stripePaymentIntentParamsResult.isErr()) {
      captureException(stripePaymentIntentParamsResult.error);

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          stripePaymentIntentParamsResult.error,
        ),
      );
    }

    const createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent(
      stripePaymentIntentParamsResult.value,
    );

    if (createPaymentIntentResult.isErr()) {
      const mappedError = mapStripeErrorToApiError(createPaymentIntentResult.error);

      this.logger.warn("Failed to create payment intent", { error: mappedError });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(resolvedTransactionFlow),
          error: mappedError,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const stripePaymentIntent = createPaymentIntentResult.value;

    loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, stripePaymentIntent.id);

    this.logger.debug("Stripe created payment intent", { stripeResponse: stripePaymentIntent });

    const mappedResponseResult = this.mapStripePaymentIntentToWebhookResponse(stripePaymentIntent);

    if (mappedResponseResult.isErr()) {
      captureException(mappedResponseResult.error);
      this.logger.error("Failed to map Stripe Payment Intent to webhook response", {
        error: mappedResponseResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), mappedResponseResult.error),
      );
    }

    const [saleorMoney, stripePaymentIntentId, stripeClientSecret, stripeStatus] =
      mappedResponseResult.value;

    const recordedTransaction = new RecordedTransaction({
      saleorTransactionId: createSaleorTransactionId(event.transaction.id),
      stripePaymentIntentId,
      saleorTransactionFlow: saleorTransactionFlow,
      resolvedTransactionFlow: resolvedTransactionFlow,
      selectedPaymentMethod: selectedPaymentMethod.type,
      saleorSchemaVersion,
    });

    const recordResult = await this.transactionRecorder.recordTransaction(
      {
        saleorApiUrl: args.saleorApiUrl,
        appId: args.appId,
      },
      recordedTransaction,
    );

    if (recordResult.isErr()) {
      this.logger.error("Failed to record transaction", {
        error: recordResult.error,
      });

      return err(new BrokenAppResponse(appContextContainer.getContextValue(), recordResult.error));
    }

    this.logger.info("Wrote Transaction to DynamoDB", {
      transaction: recordedTransaction,
    });

    const transactionResult = this.resolveOkTransactionResult({
      transactionFlow: resolvedTransactionFlow,
      stripeStatus,
    });

    return ok(
      new TransactionInitializeSessionUseCaseResponses.Success({
        saleorMoney,
        stripePaymentIntentId,
        transactionResult,
        stripeClientSecret,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
