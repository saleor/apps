import { type SaleorSchemaVersion } from "@saleor/app-sdk/types";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, fromThrowable, ok, Result } from "neverthrow";
import { after } from "next/server";
import type Stripe from "stripe";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { type TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { type StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { type AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { type StripeProblemReporter } from "@/modules/app-problems";
import { type ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { type SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createSaleorTransactionFlow,
  type SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import {
  getSaleorOrderStripeDescription,
  getSaleorOrderStripeMetadata,
} from "@/modules/stripe/saleor-order-stripe-metadata";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import {
  createStripeClientSecret,
  type StripeClientSecret,
  type StripeClientSecretValidationError,
} from "@/modules/stripe/stripe-client-secret";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  type StripePaymentIntentId,
  type StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  type StripePaymentIntentStatus,
} from "@/modules/stripe/stripe-payment-intent-status";
import {
  type CreatePaymentIntentArgs,
  type IStripeCustomersApiFactory,
  type IStripePaymentIntentsApiFactory,
} from "@/modules/stripe/types";
import {
  isMissingStripeCustomerError,
  type ResolvedStripeCustomer,
  type StripeCustomerResolver,
  StripeCustomerResolverError,
} from "@/modules/stripe-customers/stripe-customer-resolver";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { type TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  parseTransactionInitializeSessionEventData,
  type TransactionInitializeSessionEventData,
  UnsupportedPaymentMethodError,
} from "./event-data-parser";
import { resolvePaymentMethodFromEventData } from "./payment-method-resolver";
import {
  TransactionInitializeSessionUseCaseResponses,
  type TransactionInitializeSessionUseCaseResponsesType,
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
  private stripeCustomersApiFactory: IStripeCustomersApiFactory;
  private stripeCustomerResolver: StripeCustomerResolver;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
    transactionRecorder: TransactionRecorderRepo;
    stripeCustomersApiFactory: IStripeCustomersApiFactory;
    stripeCustomerResolver: StripeCustomerResolver;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
    this.transactionRecorder = deps.transactionRecorder;
    this.stripeCustomersApiFactory = deps.stripeCustomersApiFactory;
    this.stripeCustomerResolver = deps.stripeCustomerResolver;
  }

  /**
   * Customer data is a nice-to-have: any failure leaves the payment as it was before customer
   * creation existed - without a Customer.
   */
  private async resolveStripeCustomer(args: {
    config: StripeConfig;
    event: TransactionInitializeSessionEventFragment;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
    problemReporter: StripeProblemReporter;
  }): Promise<ResolvedStripeCustomer | null> {
    const { config } = args;

    if (!config.customerCreationEnabled) {
      return null;
    }

    const result = await this.stripeCustomerResolver.resolve({
      source: args.event.sourceObject,
      customersApi: this.stripeCustomersApiFactory.create({ key: config.restrictedKey }),
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configId: config.id,
      idempotencyKey: args.event.idempotencyKey,
    });

    if (result.isOk()) {
      return result.value;
    }

    if (result.error instanceof StripeCustomerResolverError.PermissionDenied) {
      this.logger.warn("Restricted key lacks Customers permission, turning customer creation off");

      after(async () => {
        const disableResult = await this.appConfigRepo.disableCustomerCreation({
          saleorApiUrl: args.saleorApiUrl,
          appId: args.appId,
          configId: config.id,
        });

        if (disableResult.isErr()) {
          this.logger.error("Failed to turn customer creation off", { error: disableResult.error });
        }

        await args.problemReporter.reportCustomerCreationDisabled(config.id, config.name);
      });

      return null;
    }

    this.logger.warn("Failed to resolve Stripe Customer, creating payment intent without it", {
      error: result.error,
    });

    return null;
  }

  private prepareStripeCreatePaymentIntentParams(args: {
    event: TransactionInitializeSessionEventFragment;
    eventData: TransactionInitializeSessionEventData;
    selectedPaymentMethodOptions: Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
    idempotencyKey: string;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
    stripeCustomer: ResolvedStripeCustomer | null;
  }): Result<CreatePaymentIntentArgs, InstanceType<typeof StripeMoney.ValdationError>> {
    return StripeMoney.createFromSaleorAmount({
      amount: args.event.action.amount,
      currency: args.event.action.currency,
    }).map((stripeMoney) => {
      const { sourceObject } = args.event;
      const order = sourceObject.__typename === "Order" ? sourceObject : null;
      const description = order ? getSaleorOrderStripeDescription(order) : undefined;

      return {
        metadata: {
          saleor_source_id: sourceObject.id,
          saleor_source_type: sourceObject.__typename,
          saleor_transaction_id: createSaleorTransactionId(args.event.transaction.id),
          saleor_api_url: args.saleorApiUrl,
          saleor_app_id: args.appId,
          ...getSaleorOrderStripeMetadata({
            order,
            checkout: sourceObject.__typename === "Checkout" ? sourceObject : null,
          }),
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
          ...(description && { description }),
          ...(args.stripeCustomer && {
            customer: args.stripeCustomer.customerId,
            shipping: args.stripeCustomer.paymentShipping,
          }),
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
    problemReporter: StripeProblemReporter;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event, saleorSchemaVersion } = args;

    const saleorTransactionFlow = createSaleorTransactionFlow(event.action.actionType);

    const eventDataResult = parseTransactionInitializeSessionEventData(event.data);

    if (eventDataResult.isErr()) {
      this.logger.warn("Failed to parse event data", { error: eventDataResult.error });

      if (eventDataResult.error instanceof UnsupportedPaymentMethodError) {
        after(() => {
          args.problemReporter.reportInvalidPaymentMethod(event.sourceObject.channel.slug);
        });
      }

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

    const stripeCustomer = await this.resolveStripeCustomer({
      config: stripeConfigForThisChannel.value,
      event,
      saleorApiUrl,
      appId,
      problemReporter: args.problemReporter,
    });

    const stripePaymentIntentParamsResult = this.prepareStripeCreatePaymentIntentParams({
      eventData: eventDataResult.value,
      event: event,
      selectedPaymentMethodOptions:
        selectedPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow),
      idempotencyKey: event.idempotencyKey,
      saleorApiUrl,
      appId,
      stripeCustomer,
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

    let createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent(
      stripePaymentIntentParamsResult.value,
    );

    if (
      createPaymentIntentResult.isErr() &&
      stripeCustomer &&
      isMissingStripeCustomerError(createPaymentIntentResult.error)
    ) {
      this.logger.warn("Linked Stripe Customer was deleted, creating payment intent without it");

      const deleteResult = await this.stripeCustomerResolver.forgetCustomer(stripeCustomer.link);

      if (deleteResult.isErr()) {
        this.logger.warn("Failed to remove stale Stripe Customer link", {
          error: deleteResult.error,
        });
      }

      const {
        customer: _customer,
        shipping: _shipping,
        ...intentParams
      } = stripePaymentIntentParamsResult.value.intentParams;

      createPaymentIntentResult = await stripePaymentIntentsApi.createPaymentIntent({
        ...stripePaymentIntentParamsResult.value,
        intentParams,
        // The first attempt is stored under the original key with different params
        idempotencyKey: `${event.idempotencyKey}:without-customer`,
      });
    }

    if (createPaymentIntentResult.isErr()) {
      const mappedError = mapStripeErrorToApiError(createPaymentIntentResult.error);

      const config = {
        id: stripeConfigForThisChannel.value.id,
        name: stripeConfigForThisChannel.value.name,
      };

      after(() => args.problemReporter.reportApiProblem(mappedError, config));

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

      const paymentIntentIdResult = fromThrowable(createStripePaymentIntentId)(
        stripePaymentIntent.id,
      );

      if (paymentIntentIdResult.isOk()) {
        const cancelResult = await stripePaymentIntentsApi.cancelPaymentIntent({
          id: paymentIntentIdResult.value,
          // Best-effort rollback, not a Saleor-requested action - it has no idempotency key of its own
          idempotencyKey: undefined,
        });

        if (cancelResult.isErr()) {
          this.logger.warn("Failed to cancel orphaned Payment Intent after mapping failure", {
            stripePaymentIntentId: stripePaymentIntent.id,
            error: cancelResult.error,
          });
        }
      } else {
        this.logger.warn(
          "Cannot cancel orphaned Payment Intent - failed to parse payment intent id",
          { stripePaymentIntentId: stripePaymentIntent.id },
        );
      }

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

      const cancelResult = await stripePaymentIntentsApi.cancelPaymentIntent({
        id: stripePaymentIntentId,
        // Best-effort rollback, not a Saleor-requested action - it has no idempotency key of its own
        idempotencyKey: undefined,
      });

      if (cancelResult.isErr()) {
        this.logger.warn("Failed to cancel orphaned Payment Intent after DynamoDB write failure", {
          stripePaymentIntentId,
          error: cancelResult.error,
        });
      }

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
