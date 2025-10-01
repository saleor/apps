import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory } from "@/modules/paypal/types";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

import {
  TransactionChargeRequestedUseCaseResponses,
  TransactionChargeRequestedUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionChargeRequestedUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionChargeRequestedUseCase {
  private logger = createLogger("TransactionChargeRequestedUseCase");
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
    event: any;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

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
          new BaseError("Config for channel not found"),
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

    this.logger.debug("Capturing PayPal order with id", {
      id: transaction.pspReference,
    });

    const orderIdResult = createPayPalOrderId(transaction.pspReference);

    const captureOrderResult = await paypalOrdersApi.captureOrder({
      orderId: orderIdResult,
    });

    if (captureOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(captureOrderResult.error);

      this.logger.error("Failed to capture order", {
        error,
      });

      return ok(
        new TransactionChargeRequestedUseCaseResponses.Failure({
          transactionResult: new ChargeFailureResult(),
          paypalOrderId: orderIdResult,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(captureOrderResult.value);

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    const saleorMoney = saleorMoneyResult.value;

    return ok(
      new TransactionChargeRequestedUseCaseResponses.Success({
        transactionResult: new ChargeSuccessResult(),
        paypalOrderId: orderIdResult,
        saleorMoney,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
