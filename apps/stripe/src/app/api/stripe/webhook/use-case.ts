import { APL, AuthData } from "@saleor/app-sdk/APL";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  ITransactionEventReporter,
  TransactionEventReporterErrors,
} from "@/modules/saleor/transaction-event-reporter";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { IStripeEventVerify } from "@/modules/stripe/types";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { StripePaymentIntentHandler } from "./stripe-object-handlers/stripe-payment-intent-handler";
import { StripeRefundHandler } from "./stripe-object-handlers/stripe-refund-handler";

type SuccessResult = StripeWebhookSuccessResponse;
type ErrorResult = StripeWebhookErrorResponse;

type R = Promise<Result<SuccessResult, ErrorResult>>;

type StripeVerifyEventFactory = (stripeClient: StripeClient) => IStripeEventVerify;
type SaleorTransactionEventReporterFactory = (authData: AuthData) => ITransactionEventReporter;

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

  private async processEvent({
    event,
    saleorApiUrl,
    appId,
    stripeEnv,
  }: {
    event: Stripe.Event;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
    stripeEnv: StripeEnv;
  }) {
    switch (event.data.object.object) {
      case "payment_intent": {
        const handler = new StripePaymentIntentHandler();

        return handler.processPaymentIntentEvent({
          event,
          stripeEnv,
          transactionRecorder: this.transactionRecorder,
          appId,
          saleorApiUrl,
        });
      }

      case "refund": {
        const handler = new StripeRefundHandler();

        return handler.processRefundEvent({
          event,
          stripeEnv,
          transactionRecorder: this.transactionRecorder,
          appId,
          saleorApiUrl,
        });
      }

      default: {
        throw new BaseError(`Support for object ${event.data.object.object} not implemented`);
      }
    }
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

    if (authData.appId !== webhookParams.appId) {
      this.logger.error(
        "Received webhook with different appId than expected. There may be old webhook from uninstalled app",
      );

      /*
       * todo that next?
       * - return 200?
       * - return 500?
       * - remove webhook and return 200?
       */
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

    const processingResult = await this.processEvent({
      event: event.value,
      saleorApiUrl: webhookParams.saleorApiUrl,
      appId: authData.appId,
      stripeEnv: config.value.getStripeEnvValue(),
    });

    if (processingResult.isErr()) {
      return err(new StripeWebhookErrorResponse(processingResult.error));
    }

    const reportResult = await transactionEventReporter.reportTransactionEvent(
      processingResult.value.resolveEventReportVariables(),
    );

    if (reportResult.isErr()) {
      if (reportResult.error instanceof TransactionEventReporterErrors.AlreadyReportedError) {
        this.logger.info("Transaction event already reported");

        return ok(new StripeWebhookSuccessResponse());
      }

      return err(new StripeWebhookErrorResponse(reportResult.error));
    }

    return ok(new StripeWebhookSuccessResponse());
  }
}
