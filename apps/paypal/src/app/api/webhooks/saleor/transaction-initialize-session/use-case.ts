import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, fromThrowable, ok, Result } from "neverthrow";
import PayPal from "paypal";

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
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  createSaleorTransactionFlow,
  SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import {
  createPayPalClientSecret,
  PayPalClientSecret,
  PayPalClientSecretValidationError,
} from "@/modules/paypal/paypal-client-secret";
import { PayPalMoney } from "@/modules/paypal/paypal-money";
import {
  createPayPalOrderId,
  PayPalOrderId,
  PayPalOrderValidationError,
} from "@/modules/paypal/paypal-payment-intent-id";
import {
  createPayPalOrderStatus,
  PayPalOrderStatus,
} from "@/modules/paypal/paypal-payment-intent-status";
import { CreateOrderArgs, IPayPalOrdersApiFactory } from "@/modules/paypal/types";
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
  private paypalOrdersApiFactory: IPayPalOrdersApiFactory;
  private transactionRecorder: TransactionRecorderRepo;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    paypalOrdersApiFactory: IPayPalOrdersApiFactory;
    transactionRecorder: TransactionRecorderRepo;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.paypalOrdersApiFactory = deps.paypalOrdersApiFactory;
    this.transactionRecorder = deps.transactionRecorder;
  }

  private preparePayPalCreateOrderParams(args: {
    event: TransactionInitializeSessionEventFragment;
    eventData: TransactionInitializeSessionEventData;
    selectedPaymentMethodOptions: PayPal.OrderCreateParams.PaymentMethodOptions;
    idempotencyKey: string;
  }): Result<CreateOrderArgs, InstanceType<typeof PayPalMoney.ValdationError>> {
    return PayPalMoney.createFromSaleorAmount({
      amount: args.event.action.amount,
      currency: args.event.action.currency,
    }).map((paypalMoney) => {
      return {
        metadata: {
          saleor_source_id: args.event.sourceObject.id,
          saleor_source_type: args.event.sourceObject.__typename,
          saleor_transaction_id: createSaleorTransactionId(args.event.transaction.id),
        },
        paypalMoney,
        idempotencyKey: args.idempotencyKey,
        intentParams: {
          /*
           * Enable all payment methods configured in the PayPal Dashboard.
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

  private mapPayPalOrderToWebhookResponse(
    order: PayPal.Order,
  ): Result<
    [SaleorMoney, PayPalOrderId, PayPalClientSecret, PayPalOrderStatus],
    InstanceType<
      | typeof PayPalOrderValidationError
      | typeof SaleorMoney.ValidationError
      | typeof PayPalClientSecretValidationError
    >
  > {
    return Result.combine([
      resolveSaleorMoneyFromPayPalOrder(order),
      fromThrowable(createPayPalOrderId)(order.id),
      createPayPalClientSecret(order.client_secret),
      fromThrowable(createPayPalOrderStatus)(order.status),
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
    paypalStatus,
  }: {
    transactionFlow: ResolvedTransactionFlow;
    paypalStatus: PayPalOrderStatus;
  }): ChargeActionRequiredResult | AuthorizationActionRequiredResult {
    if (transactionFlow === "AUTHORIZATION") {
      return new AuthorizationActionRequiredResult(paypalStatus);
    }

    return new ChargeActionRequiredResult(paypalStatus);
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
      this.logger.warn("Failed to parse event data", { error: eventDataResult.error });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(saleorTransactionFlow),
          error: eventDataResult.error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const paypalConfigForThisChannel = await this.appConfigRepo.getPayPalConfig({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (paypalConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: paypalConfigForThisChannel.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          paypalConfigForThisChannel.error,
        ),
      );
    }

    if (!paypalConfigForThisChannel.value) {
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
      paypalEnv: paypalConfigForThisChannel.value.getPayPalEnvValue(),
    });

    const clientSecret = paypalConfigForThisChannel.value.clientSecret;

    const paypalOrdersApi = this.paypalOrdersApiFactory.create({
      key: clientSecret,
    });

    this.logger.debug("Creating PayPal payment intent with params", {
      params: args.event.action,
    });

    const selectedPaymentMethod = resolvePaymentMethodFromEventData(eventDataResult.value);

    const resolvedTransactionFlow =
      selectedPaymentMethod.getResolvedTransactionFlow(saleorTransactionFlow);

    const paypalOrderParamsResult = this.preparePayPalCreateOrderParams({
      eventData: eventDataResult.value,
      event: event,
      selectedPaymentMethodOptions:
        selectedPaymentMethod.getCreateOrderMethodOptions(saleorTransactionFlow),
      idempotencyKey: event.idempotencyKey,
    });

    if (paypalOrderParamsResult.isErr()) {
      captureException(paypalOrderParamsResult.error);

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          paypalOrderParamsResult.error,
        ),
      );
    }

    const createOrderResult = await paypalOrdersApi.createOrder(
      paypalOrderParamsResult.value,
    );

    if (createOrderResult.isErr()) {
      const mappedError = mapPayPalErrorToApiError(createOrderResult.error);

      this.logger.error("Failed to create payment intent", { error: mappedError });

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: this.resolveErrorTransactionResult(resolvedTransactionFlow),
          error: mappedError,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const paypalOrder = createOrderResult.value;

    loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, paypalOrder.id);

    this.logger.debug("PayPal created payment intent", { paypalResponse: paypalOrder });

    const mappedResponseResult = this.mapPayPalOrderToWebhookResponse(paypalOrder);

    if (mappedResponseResult.isErr()) {
      captureException(mappedResponseResult.error);
      this.logger.error("Failed to map PayPal Payment Intent to webhook response", {
        error: mappedResponseResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), mappedResponseResult.error),
      );
    }

    const [saleorMoney, paypalOrderId, paypalClientSecret, paypalStatus] =
      mappedResponseResult.value;

    const recordedTransaction = new RecordedTransaction({
      saleorTransactionId: createSaleorTransactionId(event.transaction.id),
      paypalOrderId,
      saleorTransactionFlow: saleorTransactionFlow,
      resolvedTransactionFlow: resolvedTransactionFlow,
      selectedPaymentMethod: selectedPaymentMethod.type,
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

    this.logger.info("Wrote Transaction to PostgreSQL", {
      transaction: recordedTransaction,
    });

    const transactionResult = this.resolveOkTransactionResult({
      transactionFlow: resolvedTransactionFlow,
      paypalStatus,
    });

    return ok(
      new TransactionInitializeSessionUseCaseResponses.Success({
        saleorMoney,
        paypalOrderId,
        transactionResult,
        paypalClientSecret,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
