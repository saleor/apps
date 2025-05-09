import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { mapStripeErrorToApiError } from "@/modules/stripe/stripe-api-error";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
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

  private getFailureAppResult({
    resolvedTransactionFlow,
    stripePaymentIntentId,
    stripeEnv,
  }: {
    resolvedTransactionFlow: ResolvedTransactionFlow;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    if (resolvedTransactionFlow === "CHARGE") {
      return new ChargeFailureResult({
        stripePaymentIntentId,
        stripeEnv,
      });
    }

    return new AuthorizationFailureResult({
      stripePaymentIntentId,
      stripeEnv,
    });
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: TransactionProcessSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { appId, saleorApiUrl, event } = args;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId: event.sourceObject.channel.id,
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
        channelId: event.sourceObject.channel.id,
      });

      return err(new AppIsNotConfiguredResponse());
    }

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

      return err(new MalformedRequestResponse());
    }

    if (getPaymentIntentResult.isErr()) {
      const error = mapStripeErrorToApiError(getPaymentIntentResult.error);

      this.logger.error("Failed to get payment intent", {
        error,
      });

      return ok(
        new TransactionProcessSessionUseCaseResponses.Failure({
          error,
          transactionResult: this.getFailureAppResult({
            resolvedTransactionFlow: recordedTransactionResult.value.resolvedTransactionFlow,
            stripePaymentIntentId: paymentIntentIdResult,
            stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
          }),
          saleorEventAmount: event.action.amount,
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

      return err(new BrokenAppResponse());
    }

    const stripePaymentIntentStatus = createStripePaymentIntentStatus(
      getPaymentIntentResult.value.status,
    );

    const MappedResult = mapPaymentIntentStatusToTransactionResult(
      stripePaymentIntentStatus,
      recordedTransactionResult.value.resolvedTransactionFlow,
    );

    const result = new MappedResult({
      stripePaymentIntentId: paymentIntentIdResult,
      stripeStatus: stripePaymentIntentStatus,
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

    return ok(
      new TransactionProcessSessionUseCaseResponses.Success({
        transactionResult: result,
        saleorMoney: saleorMoneyResult.value,
      }),
    );
  }
}
