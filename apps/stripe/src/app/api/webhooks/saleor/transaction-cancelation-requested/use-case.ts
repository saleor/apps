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
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { createTimestampFromPaymentIntent } from "@/modules/stripe/stripe-timestamps";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

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
  private transactionRecorder: TransactionRecorderRepo;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
    transactionRecorder: TransactionRecorderRepo;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
    this.transactionRecorder = deps.transactionRecorder;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionCancelationRequestedEventFragment;
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
          new BaseError("No config found for channel"),
        ),
      );
    }

    appContextContainer.set({
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

    const restrictedKey = stripeConfigForThisChannel.value.restrictedKey;

    const stripePaymentIntentId = createStripePaymentIntentId(transaction.pspReference);

    // Get the recorded transaction to check for vendor-specific Stripe account
    const recordedTransactionResult =
      await this.transactionRecorder.getTransactionByStripePaymentIntentId(
        {
          appId: args.appId,
          saleorApiUrl: args.saleorApiUrl,
        },
        stripePaymentIntentId,
      );

    let stripeAccountId: string | undefined;

    if (recordedTransactionResult.isOk()) {
      stripeAccountId = recordedTransactionResult.value.stripeAccountId;
      if (stripeAccountId) {
        this.logger.info("Using vendor-specific Stripe account for cancel", {
          stripeAccountId,
          paymentIntentId: stripePaymentIntentId,
        });
      }
    } else {
      this.logger.warn("Could not retrieve recorded transaction", {
        error: recordedTransactionResult.error,
        paymentIntentId: stripePaymentIntentId,
      });
    }

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Canceling Stripe payment intent with id", {
      id: transaction.pspReference,
      stripeAccountId: stripeAccountId || "default",
    });

    const cancelPaymentIntentResult = await stripePaymentIntentsApi.cancelPaymentIntent({
      id: stripePaymentIntentId,
      stripeAccount: stripeAccountId,
    });

    if (cancelPaymentIntentResult.isErr()) {
      const error = mapStripeErrorToApiError(cancelPaymentIntentResult.error);

      this.logger.error("Failed to capture payment intent", {
        error,
      });

      return ok(
        new TransactionCancelationRequestedUseCaseResponses.Failure({
          stripePaymentIntentId,
          transactionResult: new CancelFailureResult(),
          error,
          appContext: appContextContainer.getContextValue(),
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

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney: saleorMoneyResult.value,
        stripePaymentIntentId,
        transactionResult: new CancelSuccessResult(),
        timestamp: createTimestampFromPaymentIntent(cancelPaymentIntentResult.value),
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
