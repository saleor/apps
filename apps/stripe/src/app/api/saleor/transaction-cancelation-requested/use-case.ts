import { err, ok, Result } from "neverthrow";

import { TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
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
    event: TransactionCancelationRequestedEventFragment;
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

    this.logger.debug("Canceling Stripe payment intent with id", {
      id: event.transaction.pspReference,
    });

    const stripePaymentIntentId = createStripePaymentIntentId(event.transaction.pspReference);

    const cancelPaymentIntentResult = await stripePaymentIntentsApi.cancelPaymentIntent({
      id: stripePaymentIntentId,
    });

    if (cancelPaymentIntentResult.isErr()) {
      this.logger.error("Failed to capture payment intent", {
        error: cancelPaymentIntentResult.error,
      });

      const mappedError = mapStripeErrorToApiError(cancelPaymentIntentResult.error);

      return ok(
        new TransactionCancelationRequestedUseCaseResponses.Failure({
          // TODO: remove this when Saleor won't require amount in the event
          saleorEventAmount: 0,
          transactionResult: new CancelFailureResult({
            stripePaymentIntentId,
            stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
          }),
          error: mappedError,
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromStripePaymentIntent(
      cancelPaymentIntentResult.value,
    );

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(new BrokenAppResponse());
    }

    return ok(
      new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney: saleorMoneyResult.value,
        transactionResult: new CancelSuccessResult({
          stripePaymentIntentId,
          stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
        }),
      }),
    );
  }
}
