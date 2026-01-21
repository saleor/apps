import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import { createTimestampFromPaymentIntent } from "@/modules/stripe/stripe-timestamps";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { mapPaymentIntentStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import {
  TransactionProcessSessionUseCaseResponses,
  TransactionProcessSessionUseCaseResponsesType,
} from "./use-case-response";

type UseCaseExecuteResult = Result<
  TransactionProcessSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionProcessSessionUseCase {
  private logger = createLogger("TransactionProcessSessionUseCase");
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

  private getFailureAppResult(resolvedTransactionFlow: ResolvedTransactionFlow) {
    if (resolvedTransactionFlow === "CHARGE") {
      return new ChargeFailureResult();
    }

    return new AuthorizationFailureResult();
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionProcessSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, event.transaction.pspReference);

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId: event.sourceObject.channel.id,
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
        channelId: event.sourceObject.channel.id,
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

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: restrictedKey,
    });

    const paymentIntentIdResult = createStripePaymentIntentId(event.transaction.pspReference);

    const getPaymentIntentResult = await stripePaymentIntentsApi.getPaymentIntent({
      id: paymentIntentIdResult,
    });

    const recordedTransactionResult =
      await this.transactionRecorder.getTransactionByStripePaymentIntentId(
        {
          appId: args.appId,
          saleorApiUrl: args.saleorApiUrl,
        },
        paymentIntentIdResult,
      );

    if (recordedTransactionResult.isErr()) {
      this.logger.error("Failed to get recorded transaction", {
        error: recordedTransactionResult.error,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          recordedTransactionResult.error,
        ),
      );
    }

    if (getPaymentIntentResult.isErr()) {
      const error = mapStripeErrorToApiError(getPaymentIntentResult.error);

      this.logger.warn("Failed to get payment intent", {
        error,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponses.Failure({
          error,
          transactionResult: this.getFailureAppResult(
            recordedTransactionResult.value.resolvedTransactionFlow,
          ),
          stripePaymentIntentId: paymentIntentIdResult,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const saleorMoneyResult = resolveSaleorMoneyFromStripePaymentIntent(
      getPaymentIntentResult.value,
    );

    if (saleorMoneyResult.isErr()) {
      captureException(saleorMoneyResult.error);

      this.logger.error("Failed to create Saleor Money from Stripe getPaymentIntent call", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(appContextContainer.getContextValue(), saleorMoneyResult.error),
      );
    }

    return ok(
      new TransactionProcessSessionUseCaseResponses.Success({
        transactionResult: mapPaymentIntentStatusToTransactionResult(
          createStripePaymentIntentStatus(getPaymentIntentResult.value.status),
          recordedTransactionResult.value.resolvedTransactionFlow,
        ),
        stripePaymentIntentId: paymentIntentIdResult,
        saleorMoney: saleorMoneyResult.value,
        timestamp: createTimestampFromPaymentIntent(getPaymentIntentResult.value),
        appContext: appContextContainer.getContextValue(),
        saleorPaymentMethodDetails: SaleorPaymentMethodDetails.createFromStripe(
          getPaymentIntentResult.value.payment_method,
        ).unwrapOr(null),
      }),
    );
  }
}
