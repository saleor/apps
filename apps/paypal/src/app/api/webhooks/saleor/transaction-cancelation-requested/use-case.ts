import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

import {
  TransactionCancelationRequestedUseCaseResponses,
  TransactionCancelationRequestedUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionCancelationRequestedUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionCancelationRequestedUseCase {
  private logger = createLogger("TransactionCancelationRequestedUseCase");
  private appConfigRepo: AppConfigRepo;
  private paypalOrdersApiFactory: IPayPalOrdersApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    paypalOrdersApiFactory: IPayPalOrdersApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.paypalOrdersApiFactory = deps.paypalOrdersApiFactory;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionCancelationRequestedEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    // loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, transaction.pspReference);

    const paypalConfigForThisChannel = await this.appConfigRepo.getPayPalConfig({
      channelId,
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
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(
          appContextContainer.getContextValue(),
          new BaseError("No config found for channel"),
        ),
      );
    }

    appContextContainer.set({
      paypalEnv: paypalConfigForThisChannel.value.getPayPalEnvValue(),
    });

    const paypalOrdersApi = this.paypalOrdersApiFactory.create({
      clientId: paypalConfigForThisChannel.value.clientId,
      clientSecret: paypalConfigForThisChannel.value.clientSecret,
      env: paypalConfigForThisChannel.value.environment,
    });

    this.logger.debug("Getting PayPal order with id", {
      id: transaction.pspReference,
    });

    const paypalOrderId = createPayPalOrderId(transaction.pspReference);

    // PayPal doesn't have a direct cancel endpoint, we get the order to verify it exists
    const getOrderResult = await paypalOrdersApi.getOrder({
      orderId: paypalOrderId,
    });

    if (getOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(getOrderResult.error);

      this.logger.error("Failed to get PayPal order", {
        error,
      });

      return ok(
        new TransactionCancelationRequestedUseCaseResponses.Failure({
          paypalOrderId,
          transactionResult: new CancelFailureResult(),
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(
      getOrderResult.value,
    );

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney: saleorMoneyResult.value,
        paypalOrderId,
        transactionResult: new CancelSuccessResult(),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
