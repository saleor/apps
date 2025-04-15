import { APL, AuthData } from "@saleor/app-sdk/APL";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";

import { PaymentIntentSucceededHandler } from "@/app/api/stripe/webhook/stripe-event-handlers/payment-intent-succeeded-handler";
import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { ITransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripeEventVerify } from "@/modules/stripe/types";
import {
  TransactionRecorder,
  TransactionRecorderError,
} from "@/modules/transactions-recording/transaction-recorder";

type SuccessResult = StripeWebhookSuccessResponse;
type ErrorResult = StripeWebhookErrorResponse;

type R = Promise<Result<SuccessResult, ErrorResult>>;

type StripeVerifyEventFactory = (stripeClient: StripeClient) => IStripeEventVerify;
type SaleorTransactionEventReporterFactory = (authData: AuthData) => ITransactionEventReporter;

/**
 * TODO: We need to store events to DB to handle deduplication
 */
export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;
  private webhookEventVerifyFactory: StripeVerifyEventFactory;
  private apl: APL;
  private logger = createLogger("StripeWebhookUseCase");
  private transactionRecorder: TransactionRecorder;
  private transactionEventReporterFactory: SaleorTransactionEventReporterFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerifyEventFactory;
    apl: APL;
    transactionRecorder: TransactionRecorder;
    transactionEventReporterFactory: SaleorTransactionEventReporterFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventVerifyFactory = deps.webhookEventVerifyFactory;
    this.apl = deps.apl;
    this.transactionRecorder = deps.transactionRecorder;
    this.transactionEventReporterFactory = deps.transactionEventReporterFactory;
  }

  async execute({
    rawBody,
    signatureHeader,
    webhookParams,
  }: {
    /**
     * Raw request body for signature verification
     */
    rawBody: string;
    /**
     * Header that Stripe sends with webhook
     */
    signatureHeader: string;
    /**
     * Parsed params that come from Stripe Webhook
     */
    webhookParams: WebhookParams;
  }): R {
    const authData = await this.apl.get(webhookParams.saleorApiUrl);

    if (!authData) {
      captureException(
        new BaseError("AuthData from APL is empty, installation may be broken"),
        (s) => s.setLevel("warning"),
      );

      return err(
        new StripeWebhookErrorResponse(
          new BaseError("Missing Saleor Auth Data. App installation is broken"),
        ),
      );
    }

    const transactionEventReporter = this.transactionEventReporterFactory(authData);

    const config = await this.appConfigRepo.getStripeConfig({
      configId: webhookParams.configurationId,
      appId: authData.appId,
      saleorApiUrl: webhookParams.saleorApiUrl,
    });

    if (config.isErr()) {
      const error = new BaseError("Failed to fetch config from database", {
        cause: config.error,
      });

      captureException(error);

      return err(new StripeWebhookErrorResponse(error));
    }

    if (!config.value) {
      return err(
        new StripeWebhookErrorResponse(
          new BaseError("Config missing, app is not configured properly"),
        ),
      );
    }

    const stripeClient = StripeClient.createFromRestrictedKey(config.value.restrictedKey);
    const eventVerifier = this.webhookEventVerifyFactory(stripeClient);

    const event = eventVerifier.verifyEvent({
      rawBody,
      webhookSecret: config.value.webhookSecret,
      signatureHeader,
    });

    if (event.isErr()) {
      return err(new StripeWebhookErrorResponse(event.error));
    }

    // TODO: There may be more than one object in single event (data.object)

    const stripePaymentIntentId = createStripePaymentIntentId(event.value.id);

    if (stripePaymentIntentId.isErr()) {
      return err(new StripeWebhookErrorResponse(stripePaymentIntentId.error));
    }

    const recordedTransaction =
      await this.transactionRecorder.getTransactionByStripePaymentIntentId(
        stripePaymentIntentId.value,
      );

    if (recordedTransaction.isErr()) {
      const recordedTransactionError = recordedTransaction.error;

      switch (recordedTransactionError["constructor"]) {
        default:
        case TransactionRecorderError.PersistenceNotAvailable: {
          captureException(
            new BaseError("Can not retrieve recorded transaction from database", {
              cause: recordedTransactionError,
            }),
          );

          return err(new StripeWebhookErrorResponse(recordedTransactionError));
        }
      }
    }

    switch (event.value.type) {
      case "payment_intent.succeeded": {
        const eventHandler = new PaymentIntentSucceededHandler();
        const resultEvent = await eventHandler.processEvent({
          recordedTransaction: recordedTransaction.value,
          event: event.value,
        });

        if (resultEvent.isErr()) {
          return err(new StripeWebhookErrorResponse(resultEvent.error));
        }

        const reportResult = await transactionEventReporter.reportTransactionEvent(
          resultEvent.value.getTransactionReportVariables(),
        );

        if (reportResult.isErr()) {
          return err(new StripeWebhookErrorResponse(reportResult.error));
        }

        return ok(new StripeWebhookSuccessResponse());
      }
      default: {
        throw new Error("Event not implemented");
      }
    }
  }
}
