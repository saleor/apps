import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { mapStripeGetPaymentIntentErrorToApiError } from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import {
  AuthorizationErrorResult,
  ChargeErrorResult,
} from "@/modules/transaction-result/error-result";
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

  private mapStripeGetPaymentIntentToWebhookResponseParams(
    stripePaymentIntentResponse: Stripe.PaymentIntent,
  ) {
    return Result.combine([
      SaleorMoney.createFromStripe({
        amount: stripePaymentIntentResponse.amount,
        currency: stripePaymentIntentResponse.currency,
      }),
      createStripePaymentIntentStatus(stripePaymentIntentResponse.status),
    ]);
  }

  private getErrorAppResult({
    resolvedTransactionFlow,
    stripePaymentIntentId,
    saleorEventAmount,
    stripeEnv,
  }: {
    resolvedTransactionFlow: ResolvedTransactionFlow;
    stripePaymentIntentId: StripePaymentIntentId;
    saleorEventAmount: number;
    stripeEnv: StripeEnv;
  }) {
    if (resolvedTransactionFlow === "CHARGE") {
      return new ChargeErrorResult({
        stripePaymentIntentId,
        saleorEventAmount,
        stripeEnv,
      });
    }

    return new AuthorizationErrorResult({
      stripePaymentIntentId,
      saleorEventAmount,
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
      this.logger.error("Failed to get payment intent", {
        error: getPaymentIntentResult.error,
      });

      const mappedError = mapStripeGetPaymentIntentErrorToApiError(getPaymentIntentResult.error);

      return ok(
        new TransactionProcessSessionUseCaseResponses.Error({
          error: mappedError,
          transactionResult: this.getErrorAppResult({
            resolvedTransactionFlow: recordedTransactionResult.value.resolvedTransactionFlow,
            stripePaymentIntentId: paymentIntentIdResult,
            saleorEventAmount: event.action.amount,
            stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
          }),
        }),
      );
    }

    const mappedResponseResult = this.mapStripeGetPaymentIntentToWebhookResponseParams(
      getPaymentIntentResult.value,
    );

    if (mappedResponseResult.isErr()) {
      captureException(mappedResponseResult.error);
      this.logger.error("Failed to map Stripe Payment Intent to webhook response", {
        error: mappedResponseResult.error,
      });

      return err(new BrokenAppResponse());
    }

    const [saleorMoney, stripePaymentIntentStatus] = mappedResponseResult.value;

    const MappedResult = mapPaymentIntentStatusToTransactionResult(
      stripePaymentIntentStatus,
      recordedTransactionResult.value.resolvedTransactionFlow,
    );

    const result = new MappedResult({
      saleorMoney,
      stripePaymentIntentId: paymentIntentIdResult,
      stripeStatus: stripePaymentIntentStatus,
      stripeEnv: stripeConfigForThisChannel.value.getStripeEnvValue(),
    });

    return ok(new TransactionProcessSessionUseCaseResponses.Ok({ transactionResult: result }));
  }
}
