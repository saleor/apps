import { err, ok, Result } from "neverthrow";

import { TransactionCancelationRequestedEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
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

    const transaction = getTransactionFromRequestedEventPayload(event);
    const channelId = getChannelIdFromRequestedEventPayload(event);

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
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
        channelId,
      });

      return err(new AppIsNotConfiguredResponse());
    }

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Canceling Stripe payment intent with id", {
      id: transaction.pspReference,
    });

    const stripePaymentIntentId = createStripePaymentIntentId(transaction.pspReference);

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

    const saleorMoneyResult = SaleorMoney.createFromStripe({
      amount: cancelPaymentIntentResult.value.amount,
      currency: cancelPaymentIntentResult.value.currency,
    });

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to create Saleor money", {
        error: saleorMoneyResult.error,
      });

      return err(new BrokenAppResponse());
    }

    const saleorMoney = saleorMoneyResult.value;

    return ok(
      new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney,
        transactionResult: new CancelSuccessResult({
          stripePaymentIntentId,
          stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
        }),
      }),
    );
  }
}
