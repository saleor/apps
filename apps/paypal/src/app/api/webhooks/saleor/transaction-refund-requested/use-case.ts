import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { PayPalMoney } from "@/modules/paypal/paypal-money";
import { createPayPalOrderId } from "@/modules/paypal/paypal-payment-intent-id";
import { createPayPalRefundId } from "@/modules/paypal/paypal-refund-id";
import { IPayPalRefundsApiFactory } from "@/modules/paypal/types";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

import {
  TransactionRefundRequestedUseCaseResponses,
  TransactionRefundRequestedUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionRefundRequestedUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionRefundRequestedUseCase {
  private logger = createLogger("TransactionRefundRequestedUseCase");
  private appConfigRepo: AppConfigRepo;
  private paypalRefundsApiFactory: IPayPalRefundsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    paypalRefundsApiFactory: IPayPalRefundsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.paypalRefundsApiFactory = deps.paypalRefundsApiFactory;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionRefundRequestedEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, transaction.pspReference);

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

    const clientSecret = paypalConfigForThisChannel.value.clientSecret;

    const paypalRefundsApi = this.paypalRefundsApiFactory.create({
      key: clientSecret,
    });

    this.logger.debug("Refunding PayPal payment intent with id", {
      id: transaction.pspReference,
      action: event.action,
    });

    const paypalOrderId = createPayPalOrderId(transaction.pspReference);

    const paypalMoneyResult = PayPalMoney.createFromSaleorAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    });

    if (paypalMoneyResult.isErr()) {
      this.logger.error("Failed to create PayPal money", {
        error: paypalMoneyResult.error,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          paypalMoneyResult.error,
        ),
      );
    }

    const createRefundResult = await paypalRefundsApi.createRefund({
      orderId: paypalOrderId,
      paypalMoney: paypalMoneyResult.value,
      metadata: {
        saleor_source_id: transaction.checkout?.id
          ? transaction.checkout.id
          : transaction.order?.id,
        saleor_source_type: transaction.checkout ? "Checkout" : "Order",
        saleor_transaction_id: createSaleorTransactionId(transaction.id),
      },
    });

    if (createRefundResult.isErr()) {
      const error = mapPayPalErrorToApiError(createRefundResult.error);

      this.logger.error("Failed to create refund", {
        error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          transactionResult: new RefundFailureResult(),
          paypalOrderId,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const refund = createRefundResult.value;

    this.logger.debug("Refund created", {
      refund,
    });

    const saleorMoneyResult = SaleorMoney.createFromPayPal({
      amount: refund.amount,
      currency: refund.currency,
    });

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponses.Success({
        paypalRefundId: createPayPalRefundId(refund.id),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
