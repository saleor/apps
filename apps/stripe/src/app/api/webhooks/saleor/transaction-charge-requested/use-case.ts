import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionChargeRequestedEventFragment } from "@/generated/graphql";
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
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

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
    event: TransactionChargeRequestedEventFragment;
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

    const paymentIntentIdResult = createStripePaymentIntentId(transaction.pspReference);

    // Get the recorded transaction to check for vendor-specific Stripe account
    const recordedTransactionResult =
      await this.transactionRecorder.getTransactionByStripePaymentIntentId(
        {
          appId: args.appId,
          saleorApiUrl: args.saleorApiUrl,
        },
        paymentIntentIdResult,
      );

    let stripeAccountId: string | undefined;

    if (recordedTransactionResult.isOk()) {
      stripeAccountId = recordedTransactionResult.value.stripeAccountId;
      if (stripeAccountId) {
        this.logger.info("Using vendor-specific Stripe account for capture", {
          stripeAccountId,
          paymentIntentId: paymentIntentIdResult,
        });
      }
    } else {
      this.logger.warn("Could not retrieve recorded transaction", {
        error: recordedTransactionResult.error,
        paymentIntentId: paymentIntentIdResult,
      });
    }

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    this.logger.debug("Capturing Stripe payment intent with id", {
      id: transaction.pspReference,
      stripeAccountId: stripeAccountId || "default",
    });

    const capturePaymentIntentResult = await stripePaymentIntentsApi.capturePaymentIntent({
      id: paymentIntentIdResult,
      stripeAccount: stripeAccountId,
    });

    if (capturePaymentIntentResult.isErr()) {
      const error = mapStripeErrorToApiError(capturePaymentIntentResult.error);

      this.logger.error("Failed to capture payment intent", {
        error,
      });

      return ok(
        new TransactionChargeRequestedUseCaseResponses.Failure({
          transactionResult: new ChargeFailureResult(),
          stripePaymentIntentId: paymentIntentIdResult,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromStripePaymentIntent(
      capturePaymentIntentResult.value,
    );

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
        stripePaymentIntentId: paymentIntentIdResult,
        saleorMoney,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}
