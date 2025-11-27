import { APL, AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { loggerContext } from "@/lib/logger-context";
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
import {
  AllowedStripeObjectMetadata,
  IStripeEventVerify,
  IStripePaymentIntentsApiFactory,
} from "@/modules/stripe/types";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { StripePaymentIntentHandler } from "./stripe-object-handlers/stripe-payment-intent-handler";
import { StripeRefundHandler } from "./stripe-object-handlers/stripe-refund-handler";
import {
  ObjectCreatedOutsideOfSaleorResponse,
  PossibleStripeWebhookErrorResponses,
  PossibleStripeWebhookSuccessResponses,
  StripeWebhookAppIsNotConfiguredResponse,
  StripeWebhookMalformedRequestResponse,
  StripeWebhookSeverErrorResponse,
  StripeWebhookSuccessResponse,
  StripeWebhookTransactionMissingResponse,
} from "./stripe-webhook-responses";
import { WebhookParams } from "./webhook-params";

type R = Promise<
  Result<PossibleStripeWebhookSuccessResponses, PossibleStripeWebhookErrorResponses>
>;

type StripeVerifyEventFactory = (stripeClient: StripeClient) => IStripeEventVerify;
type SaleorTransactionEventReporterFactory = (authData: AuthData) => ITransactionEventReporter;

const ObjectMetadataMissingError = BaseError.subclass("ObjectMetadataMissingError");

export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;
  private webhookEventVerifyFactory: StripeVerifyEventFactory;
  private apl: APL;
  private logger = createLogger("StripeWebhookUseCase");
  private transactionRecorder: TransactionRecorderRepo;
  private transactionEventReporterFactory: SaleorTransactionEventReporterFactory;
  private webhookManager: StripeWebhookManager;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    webhookEventVerifyFactory: StripeVerifyEventFactory;
    apl: APL;
    transactionRecorder: TransactionRecorderRepo;
    transactionEventReporterFactory: SaleorTransactionEventReporterFactory;
    webhookManager: StripeWebhookManager;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.webhookEventVerifyFactory = deps.webhookEventVerifyFactory;
    this.apl = deps.apl;
    this.transactionRecorder = deps.transactionRecorder;
    this.transactionEventReporterFactory = deps.transactionEventReporterFactory;
    this.webhookManager = deps.webhookManager;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
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
      this.logger.warn(`Failed to remove webhook ${webhookId}`, result.error);

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
    restrictedKey,
  }: {
    event: Stripe.Event;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
    stripeEnv: StripeEnv;
    restrictedKey: StripeRestrictedKey;
  }) {
    switch (event.data.object.object) {
      case "payment_intent": {
        loggerContext.set(ObservabilityAttributes.PSP_REFERENCE, event.data.object.id);

        const meta = event.data.object.metadata as AllowedStripeObjectMetadata;

        if (!meta?.saleor_transaction_id) {
          return err(
            new ObjectMetadataMissingError(
              "Missing metadata on object, it was not created by Saleor",
              {
                props: {
                  meta,
                },
              },
            ),
          );
        }

        const handler = new StripePaymentIntentHandler();

        const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
          key: restrictedKey,
        });

        return handler.processPaymentIntentEvent({
          event,
          stripeEnv,
          transactionRecorder: this.transactionRecorder,
          appId,
          saleorApiUrl,
          stripePaymentIntentsApi,
        });
      }

      case "refund": {
        loggerContext.set("stripeRefundId", event.data.object.id);

        const meta = event.data.object.metadata as AllowedStripeObjectMetadata;

        if (!meta?.saleor_transaction_id) {
          return err(
            new ObjectMetadataMissingError(
              "Missing metadata on object, it was not created by Saleor",
              {
                props: {
                  meta,
                },
              },
            ),
          );
        }

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

      return err(new StripeWebhookAppIsNotConfiguredResponse());
    }

    if (authData.appId !== webhookParams.appId) {
      this.logger.warn(
        "Received webhook with different appId than expected. There may be old webhook from uninstalled app. Will try to remove it now.",
      );

      const processingResult = await this.processLegacyWebhook(webhookParams);

      if (processingResult.isErr()) {
        this.logger.warn("Received legacy webhook but failed to handle removing it", {
          error: processingResult.error,
        });

        return err(new StripeWebhookAppIsNotConfiguredResponse());
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
      this.logger.error("Failed to fetch config from database", {
        error: config.error,
      });

      captureException(config.error);

      return err(new StripeWebhookAppIsNotConfiguredResponse());
    }

    if (!config.value) {
      this.logger.error("Config for given webhook is missing");

      return err(new StripeWebhookAppIsNotConfiguredResponse());
    }

    appContextContainer.set({
      stripeEnv: config.value.getStripeEnvValue(),
    });

    const stripeClient = StripeClient.createFromRestrictedKey(config.value.restrictedKey);
    const eventVerifier = this.webhookEventVerifyFactory(stripeClient);

    const event = eventVerifier.verifyEvent({
      rawBody,
      webhookSecret: config.value.webhookSecret,
      signatureHeader,
    });

    this.logger.debug("Event verified");

    if (event.isErr()) {
      this.logger.error("Failed to verify event", {
        error: event.error,
      });

      return err(new StripeWebhookMalformedRequestResponse());
    }

    this.logger.debug(`Resolved event type: ${event.value.type}`);

    const processingResult = await this.processEvent({
      event: event.value,
      saleorApiUrl: webhookParams.saleorApiUrl,
      appId: authData.appId,
      stripeEnv: config.value.getStripeEnvValue(),
      restrictedKey: config.value.restrictedKey,
    });

    if (processingResult.isErr()) {
      /**
       * This is technically not an error, so we catch it here without the error log.
       */
      if (processingResult.error instanceof ObjectMetadataMissingError) {
        return err(new ObjectCreatedOutsideOfSaleorResponse());
      }

      this.logger.error("Failed to process event", {
        error: processingResult.error,
      });

      if (processingResult.error instanceof TransactionRecorderError.TransactionMissingError) {
        return err(new StripeWebhookTransactionMissingResponse());
      }

      return err(new StripeWebhookSeverErrorResponse());
    }

    loggerContext.set(
      ObservabilityAttributes.TRANSACTION_ID,
      processingResult.value.saleorTransactionId,
    );
    loggerContext.set("amount", processingResult.value.saleorMoney.amount);
    loggerContext.set("result", processingResult.value.transactionResult.result);

    const reportResult = await transactionEventReporter.reportTransactionEvent(
      processingResult.value.resolveEventReportVariables(),
    );

    if (reportResult.isErr()) {
      if (reportResult.error instanceof TransactionEventReporterErrors.AlreadyReportedError) {
        this.logger.info("Transaction event already reported");

        return ok(new StripeWebhookSuccessResponse());
      }

      this.logger.error("Failed to report transaction event", {
        error: reportResult.error,
      });

      return err(new StripeWebhookSeverErrorResponse());
    }

    this.logger.info("Transaction event reported");

    return ok(new StripeWebhookSuccessResponse());
  }
}
