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
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
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
  private webhookManager: StripeWebhookManager;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerifyEventFactory;
    apl: APL;
    transactionRecorder: TransactionRecorderRepo;
    transactionEventReporterFactory: SaleorTransactionEventReporterFactory;
    webhookManager: StripeWebhookManager;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventVerifyFactory = deps.webhookEventVerifyFactory;
    this.apl = deps.apl;
    this.transactionRecorder = deps.transactionRecorder;
    this.transactionEventReporterFactory = deps.transactionEventReporterFactory;
    this.webhookManager = deps.webhookManager;
  }

  private async removeStripeWebhook({
    webhookId,
    restrictedKey,
  }: {
    webhookId: string;
    restrictedKey: StripeRestrictedKey;
  }) {
    const result = await this.webhookManager.removeWebhook({ webhookId, restrictedKey });

    if (result.isErr()) {
      this.logger.error(`Failed to remove webhook ${webhookId}`, result.error);

      return err(new BaseError("Failed to remove webhook", { cause: result.error }));
    }

    this.logger.info(`Webhook ${webhookId} removed successfully`);

    return ok(null);
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

  /**
   * It handles case when
   * 1. App was installed and configured. Webhook exists in Stripe
   * 2. App is removed - webhook is not
   * 3. App is reinstalled and configured again
   * 4. There are now 2 webhooks - old and new. Old one will always fail.
   *
   * At this point we detect an old webhook because it has different appId in URL (from previous installation).
   * Now we can use that to fetch old config from DB and remove the webhook.
   */
  private async processLegacyWebhook(webhookParams: WebhookParams) {
    const legacyConfig = await this.appConfigRepo.getStripeConfig({
      configId: webhookParams.configurationId,
      // Use app ID from webhook, not AuthData, so we have it frozen in time
      appId: webhookParams.appId,
      saleorApiUrl: webhookParams.saleorApiUrl,
    });

    if (legacyConfig.isErr()) {
      captureException(
        new BaseError(
          "Failed to fetch config attached to legacy Webhook, this requires manual cleanup",
          {
            cause: legacyConfig.error,
          },
        ),
      );

      return err(
        new BaseError("Failed to fetch legacy config", {
          cause: legacyConfig.error,
        }),
      );
    }

    if (!legacyConfig.value) {
      this.logger.error("Legacy config is empty, this requires manual cleanup");

      return err(new BaseError("Legacy config is empty"));
    }

    const removalResult = await this.removeStripeWebhook({
      webhookId: legacyConfig.value.webhookId,
      restrictedKey: legacyConfig.value.restrictedKey,
    });

    if (removalResult.isErr()) {
      return err(new BaseError("Failed to remove legacy webhook", { cause: removalResult.error }));
    }

    return ok(null);
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
        "Received webhook with different appId than expected. There may be old webhook from uninstalled app. Will try to remove it now.",
      );

      const processingResult = await this.processLegacyWebhook(webhookParams);

      if (processingResult.isErr()) {
        return err(
          new StripeWebhookErrorResponse(
            new BaseError("Received legacy webhook but failed to handle removing it"),
          ),
        );
      } else {
        return ok(new StripeWebhookSuccessResponse());
      }
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
