import { APL } from "@saleor/app-sdk/APL";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import {
  TransactionAuthorizationSuccess,
  TransactionChargeSuccess,
} from "@/app/api/stripe/webhook/resolved-webhook-events";
import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { ITransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { IStripeEventVerify } from "@/modules/stripe/types";
import {
  RecordedTransaction,
  TransactionRecorder,
  TransactionRecorderError,
} from "@/modules/transactions-recording/transaction-recorder";

type SuccessResult = StripeWebhookSuccessResponse;
type ErrorResult = StripeWebhookErrorResponse;

type R = Promise<Result<SuccessResult, ErrorResult>>;

type StripeVerificateEventFactory = (stripeClient: StripeClient) => IStripeEventVerify;

/**
 * TODO: We need to store events to DB to handle deduplication
 */
export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;
  private webhookEventVerifyFactory: StripeVerificateEventFactory;
  private apl: APL;
  private logger = createLogger("StripeWebhookUseCase");
  private transactionRecorder: TransactionRecorder;
  private transactionEventReporter: ITransactionEventReporter;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerificateEventFactory;
    apl: APL;
    transactionRecorder: TransactionRecorder;
    transactionEventReporter: ITransactionEventReporter;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventVerifyFactory = deps.webhookEventVerifyFactory;
    this.apl = deps.apl;
    this.transactionRecorder = deps.transactionRecorder;
    this.transactionEventReporter = deps.transactionEventReporter;
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

    const { saleorTransactionId } = recordedTransaction.value;

    const eventToReport = this.resolveResultToReport(
      stripePaymentIntentId.value,
      event.value,
      recordedTransaction.value,
    );

    if (!eventToReport) {
      const error = new BaseError("Event not implemented", {
        props: {
          event: event.value.type,
        },
      });

      captureException(error);

      return err(new StripeWebhookErrorResponse(error));
    }

    const reportResult = await this.transactionEventReporter.reportTransactionEvent({
      type: eventToReport.saleorEventType,
      message: eventToReport.message,
      time: eventToReport.date.toISOString(),
      pspReference: eventToReport.pspRef,
      transactionId: saleorTransactionId,
      amount: eventToReport.amount,
    });

    if (reportResult.isErr()) {
      // handle error

      return err(new StripeWebhookErrorResponse(reportResult.error));
    }

    return ok(new StripeWebhookSuccessResponse()); // todo
  }

  /**
   * TODO:
   * - handle complexity of nested conditions
   * - handle all events
   * - handle local errors
   */
  private resolveResultToReport(
    saleorTransactionId: StripePaymentIntentId,
    event: Stripe.Event,
    recordedTransaction: RecordedTransaction,
  ) {
    // TODO: Map events. Check which to support
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intentObject = event.data.object;
        const currency = intentObject.currency;

        switch (recordedTransaction.transactionFlow) {
          case "AUTHORIZATION": {
            // todo check docs for which amount to use
            const authorizedAmount = intentObject.amount_capturable;

            const saleorAmountToReport = SaleorMoney.createFromStripe({
              amount: authorizedAmount,
              currency,
            });

            if (saleorAmountToReport.isErr()) {
              throw new BaseError("Failed to convert Stripe amount to Saleor amount", {
                cause: saleorAmountToReport.error,
              });
            }

            return new TransactionAuthorizationSuccess({
              pspRef: saleorTransactionId,
              amount: saleorAmountToReport.value,
              date: createDateFromStripeEvent(event),
            });
          }
          case "CHARGE": {
            const capturedAmount = intentObject.amount_received;

            const saleorAmountToReport = SaleorMoney.createFromStripe({
              amount: capturedAmount,
              currency,
            });

            if (saleorAmountToReport.isErr()) {
              throw new BaseError("Failed to convert Stripe amount to Saleor amount", {
                cause: saleorAmountToReport.error,
              });
            }

            return new TransactionChargeSuccess({
              pspRef: saleorTransactionId,
              amount: saleorAmountToReport.value,
              date: createDateFromStripeEvent(event),
            });
          }
        }
      }
    }
  }
}
