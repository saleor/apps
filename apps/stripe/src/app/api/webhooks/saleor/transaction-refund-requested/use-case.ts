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
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { createStripeRefundId } from "@/modules/stripe/stripe-refund-id";
import { IStripeRefundsApiFactory } from "@/modules/stripe/types";
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
  private stripeRefundsApiFactory: IStripeRefundsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripeRefundsApiFactory: IStripeRefundsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripeRefundsApiFactory = deps.stripeRefundsApiFactory;
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

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
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
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripeRefundsApi = this.stripeRefundsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Refunding Stripe payment intent with id", {
      id: transaction.pspReference,
      action: event.action,
    });

    const stripePaymentIntentId = createStripePaymentIntentId(transaction.pspReference);

    const stripeMoneyResult = StripeMoney.createFromSaleorAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    });

    if (stripeMoneyResult.isErr()) {
      this.logger.error("Failed to create Stripe money", {
        error: stripeMoneyResult.error,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          stripeMoneyResult.error,
        ),
      );
    }

    const createRefundResult = await stripeRefundsApi.createRefund({
      paymentIntentId: stripePaymentIntentId,
      stripeMoney: stripeMoneyResult.value,
      metadata: {
        saleor_source_id: transaction.checkout?.id
          ? transaction.checkout.id
          : transaction.order?.id,
        saleor_source_type: transaction.checkout ? "Checkout" : "Order",
        saleor_transaction_id: createSaleorTransactionId(transaction.id),
      },
    });

    if (createRefundResult.isErr()) {
      const error = mapStripeErrorToApiError(createRefundResult.error);

      this.logger.warn("Failed to create refund", {
        error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          transactionResult: new RefundFailureResult(),
          stripePaymentIntentId,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const refund = createRefundResult.value;

    this.logger.debug("Refund created", {
      refund,
    });

    const saleorMoneyResult = SaleorMoney.createFromStripe({
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
        stripeRefundId: createStripeRefundId(refund.id),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
