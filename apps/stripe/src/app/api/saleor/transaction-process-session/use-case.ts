import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionProcessSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/modules/saleor/saleor-webhook-responses";
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
import { TransactionRecorder } from "@/modules/transactions-recording/transaction-recorder";

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
  private transactionRecorder: TransactionRecorder;

  static UseCaseError = BaseError.subclass("UseCaseError", {
    props: {
      _internalName: "TransactionProcessSessionUseCase.UseCaseError" as const,
    },
  });

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
    transactionRecorder: TransactionRecorder;
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

  private getErrorAppResult(
    resolvedTransactionFlow: ResolvedTransationFlow,
    stripePaymentIntentId: StripePaymentIntentId,
    saleorEventAmount: number,
  ) {
    if (resolvedTransactionFlow === "CHARGE") {
      return new ChargeErrorResult({
        stripePaymentIntentId,
        saleorEventAmount,
      });
    }

    return new AuthorizationErrorResult({
      stripePaymentIntentId,
      saleorEventAmount,
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

    if (paymentIntentIdResult.isErr()) {
      this.logger.error("Failed to create payment intent id", {
        error: paymentIntentIdResult.error,
      });

      return err(new MalformedRequestResponse());
    }

    const getPaymentIntentResult = await stripePaymentIntentsApi.getPaymentIntent({
      id: paymentIntentIdResult.value,
    });

    const recordedTransactionResult =
      await this.transactionRecorder.getTransactionByStripePaymentIntentId(
        paymentIntentIdResult.value,
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
          transactionResult: this.getErrorAppResult(
            recordedTransactionResult.value.resolvedTransactionFlow,
            paymentIntentIdResult.value,
            event.action.amount,
          ),
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
      stripePaymentIntentId: paymentIntentIdResult.value,
      stripeStatus: stripePaymentIntentStatus,
    });

    return ok(new TransactionProcessSessionUseCaseResponses.OK({ transactionResult: result }));
  }
}
