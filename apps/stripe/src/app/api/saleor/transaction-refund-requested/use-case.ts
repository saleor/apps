import { err, ok, Result } from "neverthrow";

import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
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

    // Additional validation as Saleor Graphql schema doesn't require these fields and they are needed to process the event
    if (!event.transaction) {
      this.logger.error("Transaction not found in event", {
        event,
      });

      return err(new MalformedRequestResponse());
    }

    const possibleChannelId =
      event.transaction.checkout?.channel?.id || event.transaction.order?.channel?.id;

    if (!possibleChannelId) {
      this.logger.error("Channel not found in event transaction", {
        checkoutChannelId: event.transaction?.checkout?.channel?.id,
        orderChannelId: event.transaction?.order?.channel?.id,
      });

      return err(new MalformedRequestResponse());
    }

    if (!event.action.amount) {
      this.logger.error("Saleor event amount not found in event action", {
        amount: event.action.amount,
      });

      return err(new MalformedRequestResponse());
    }

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId: possibleChannelId,
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
        channelId: possibleChannelId,
      });

      return err(new AppIsNotConfiguredResponse());
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripeRefundsApi = this.stripeRefundsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Refunding Stripe payment intent with id", {
      id: event.transaction.pspReference,
      action: event.action,
    });

    const stripePaymentIntentId = createStripePaymentIntentId(event.transaction.pspReference);
    const stripeEnv = stripeConfigForThisChannel.value.getStripeEnvValue();

    const stripeMoneyResult = StripeMoney.createFromSaleorAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    });

    if (stripeMoneyResult.isErr()) {
      this.logger.error("Failed to create Stripe money", {
        error: stripeMoneyResult.error,
      });

      return err(new MalformedRequestResponse());
    }

    const createRefundResult = await stripeRefundsApi.createRefund({
      paymentIntentId: stripePaymentIntentId,
      stripeMoney: stripeMoneyResult.value,
    });

    if (createRefundResult.isErr()) {
      const error = mapStripeErrorToApiError(createRefundResult.error);

      this.logger.error("Failed to create refund", {
        error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponses.Failure({
          transactionResult: new RefundFailureResult({
            stripePaymentIntentId,
            stripeEnv,
          }),
          saleorEventAmount: event.action.amount,
          error,
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

      return err(new BrokenAppResponse());
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponses.Success({
        stripePaymentIntentId,
      }),
    );
  }
}
