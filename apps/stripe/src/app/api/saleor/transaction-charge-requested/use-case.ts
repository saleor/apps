import { err, ok, Result } from "neverthrow";

import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { mapStripeCapturePaymentIntentErrorToApiError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

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
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionChargeRequestedEventFragment;
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

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Capturing Stripe payment intent with id", {
      id: event.transaction.pspReference,
    });

    const paymentIntentIdResult = createStripePaymentIntentId(event.transaction.pspReference);

    if (paymentIntentIdResult.isErr()) {
      this.logger.error("Failed to create payment intent id", {
        error: paymentIntentIdResult.error,
      });

      return err(new MalformedRequestResponse());
    }

    const capturePaymentIntentResult = await stripePaymentIntentsApi.capturePaymentIntent({
      id: paymentIntentIdResult.value,
    });

    if (capturePaymentIntentResult.isErr()) {
      this.logger.error("Failed to capture payment intent", {
        error: capturePaymentIntentResult.error,
      });

      const mappedError = mapStripeCapturePaymentIntentErrorToApiError(
        capturePaymentIntentResult.error,
      );

      return ok(
        new TransactionChargeRequestedUseCaseResponses.ChargeFailure({
          saleorEventAmount: event.action.amount,
          stripePaymentIntentId: paymentIntentIdResult.value,
          error: mappedError,
        }),
      );
    }

    const saleorMoneyResult = SaleorMoney.createFromStripe({
      amount: capturePaymentIntentResult.value.amount,
      currency: capturePaymentIntentResult.value.currency,
    });

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(new BrokenAppResponse());
    }

    const saleorMoney = saleorMoneyResult.value;

    return ok(
      new TransactionChargeRequestedUseCaseResponses.ChargeSuccess({
        saleorMoney,
        stripePaymentIntentId: paymentIntentIdResult.value,
      }),
    );
  }
}
