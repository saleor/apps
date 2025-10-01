import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-payment-intent-id";
import { createPayPalOrderStatus } from "@/modules/paypal/paypal-payment-intent-status";
import { createTimestampFromOrder } from "@/modules/paypal/paypal-timestamps";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { mapOrderStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  TransactionProcessSessionUseCaseResponses,
  TransactionProcessSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionProcessSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionProcessSessionUseCase {
  private logger = createLogger("TransactionProcessSessionUseCase");
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

  private getFailureAppResult(resolvedTransactionFlow: ResolvedTransactionFlow) {
    if (resolvedTransactionFlow === "CHARGE") {
      return new ChargeFailureResult();
    }

    return new AuthorizationFailureResult();
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionProcessSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, event.transaction.pspReference);

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
          new BaseError("Config for channel not found"),
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

    const orderIdResult = createPayPalOrderId(event.transaction.pspReference);

    const getOrderResult = await paypalOrdersApi.getOrder({
      id: orderIdResult,
    });

    const recordedTransactionResult =
      await this.transactionRecorder.getTransactionByPayPalOrderId(
        {
          appId: args.appId,
          saleorApiUrl: args.saleorApiUrl,
        },
        orderIdResult,
      );

    if (recordedTransactionResult.isErr()) {
      this.logger.error("Failed to get recorded transaction", {
        error: recordedTransactionResult.error,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          recordedTransactionResult.error,
        ),
      );
    }

    if (getOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(getOrderResult.error);

      this.logger.error("Failed to get payment intent", {
        error,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponses.Failure({
          error,
          transactionResult: this.getFailureAppResult(
            recordedTransactionResult.value.resolvedTransactionFlow,
          ),
          paypalOrderId: orderIdResult,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(
      getOrderResult.value,
    );

    if (saleorMoneyResult.isErr()) {
      captureException(saleorMoneyResult.error);

      this.logger.error("Failed to create Saleor Money from PayPal getOrder call", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionProcessSessionUseCaseResponses.Success({
        transactionResult: mapOrderStatusToTransactionResult(
          createPayPalOrderStatus(getOrderResult.value.status),
          recordedTransactionResult.value.resolvedTransactionFlow,
        ),
        paypalOrderId: orderIdResult,
        saleorMoney: saleorMoneyResult.value,
        timestamp: createTimestampFromOrder(getOrderResult.value),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
