import { APL, AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
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
import { loggerContext } from "@/lib/logger-context";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import {
  ITransactionEventReporter,
  TransactionEventReporterErrors,
} from "@/modules/saleor/transaction-event-reporter";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripeEventVerify } from "@/modules/stripe/types";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { PaymentIntentAmountCapturableUpdatedHandler } from "./stripe-event-handlers/payment-intent-amount-capturable-updated-handler";

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
  private transactionRecorder: TransactionRecorderRepo;
  private transactionEventReporterFactory: SaleorTransactionEventReporterFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerifyEventFactory;
    apl: APL;
    transactionRecorder: TransactionRecorderRepo;
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
    this.logger.debug("Executing");
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

    this.logger.debug("Configuration for config resolved");

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

    this.logger.debug("Event verified");

    if (event.isErr()) {
      return err(new StripeWebhookErrorResponse(event.error));
    }

    this.logger.debug(`Resolved event type: ${event.value.type}`);

    /*
     * TODO: There may be more than one object in single event (data.object)
     * todo: implement rest of events
     * todo: extract shared pieces, maybe this code should be run once and handlers implement the same interface?
     */
    switch (event.value.type) {
      case "payment_intent.succeeded": {
        const stripePaymentIntentId = createStripePaymentIntentId(event.value.data.object.id);

        if (stripePaymentIntentId.isErr()) {
          return err(new StripeWebhookErrorResponse(stripePaymentIntentId.error));
        }

        this.logger.debug(`Resolved Payment Intent ID: ${stripePaymentIntentId.value}`);
        loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, stripePaymentIntentId.value);

        const recordedTransaction =
          await this.transactionRecorder.getTransactionByStripePaymentIntentId(
            {
              appId: authData.appId,
              saleorApiUrl: webhookParams.saleorApiUrl,
            },
            stripePaymentIntentId.value,
          );

        if (recordedTransaction.isErr()) {
          this.logger.warn("Error fetching recorded transaction", {
            error: recordedTransaction.error,
          });

          return err(new StripeWebhookErrorResponse(recordedTransaction.error));
        }

        this.logger.debug("Resolved previously saved transaction");

        const eventHandler = new PaymentIntentSucceededHandler();
        const resultEvent = await eventHandler.processEvent({
          recordedTransaction: recordedTransaction.value,
          stripePaymentIntentId: stripePaymentIntentId.value,
          event: event.value,
        });

        if (resultEvent.isErr()) {
          return err(new StripeWebhookErrorResponse(resultEvent.error));
        }

        const reportResult = await transactionEventReporter.reportTransactionEvent(
          resultEvent.value.resolveEventReportVariables(),
        );

        if (reportResult.isErr()) {
          if (reportResult.error instanceof TransactionEventReporterErrors.AlreadyReportedError) {
            this.logger.info("Transaction event already reported", {
              error: reportResult,
            });

            return ok(new StripeWebhookSuccessResponse());
          }

          return err(new StripeWebhookErrorResponse(reportResult.error));
        }

        return ok(new StripeWebhookSuccessResponse());
      }
      case "payment_intent.amount_capturable_updated": {
        const stripePaymentIntentIdResult = createStripePaymentIntentId(event.value.data.object.id);

        if (stripePaymentIntentIdResult.isErr()) {
          return err(new StripeWebhookErrorResponse(stripePaymentIntentIdResult.error));
        }

        this.logger.debug(`Resolved Payment Intent ID: ${stripePaymentIntentIdResult.value}`);
        loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, stripePaymentIntentIdResult.value);

        const recordedTransaction =
          await this.transactionRecorder.getTransactionByStripePaymentIntentId(
            {
              appId: authData.appId,
              saleorApiUrl: webhookParams.saleorApiUrl,
            },
            stripePaymentIntentIdResult.value,
          );

        if (recordedTransaction.isErr()) {
          this.logger.warn("Error fetching recorded transaction");

          return err(new StripeWebhookErrorResponse(recordedTransaction.error));
        }

        this.logger.debug("Resolved previously saved transaction");

        const eventHandler = new PaymentIntentAmountCapturableUpdatedHandler();
        const resultEvent = await eventHandler.processEvent({
          recordedTransaction: recordedTransaction.value,
          stripePaymentIntentId: stripePaymentIntentIdResult.value,
          event: event.value,
        });

        if (resultEvent.isErr()) {
          return err(new StripeWebhookErrorResponse(resultEvent.error));
        }

        const reportResult = await transactionEventReporter.reportTransactionEvent(
          resultEvent.value.resolveEventReportVariables(),
        );

        if (reportResult.isErr()) {
          if (reportResult.error instanceof TransactionEventReporterErrors.AlreadyReportedError) {
            this.logger.info("Transaction event already reported", {
              error: reportResult,
            });

            return ok(new StripeWebhookSuccessResponse());
          }

          return err(new StripeWebhookErrorResponse(reportResult.error));
        }

        return ok(new StripeWebhookSuccessResponse());
      }

      default: {
        throw new BaseError(`Support for event ${event.value.type} not implemented`);
      }
    }
  }
}
