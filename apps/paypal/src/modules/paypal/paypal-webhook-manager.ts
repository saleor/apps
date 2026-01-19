import { ok, err, Result } from "neverthrow";
import { createLogger } from "@/lib/logger";
import { PayPalWebhooksApi, RECOMMENDED_WEBHOOK_EVENTS } from "./paypal-webhooks-api";
import { PayPalClientId, createPayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret, createPayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";

const logger = createLogger("PayPalWebhookManager");

/**
 * Result of webhook registration
 */
export interface WebhookRegistrationResult {
  webhookId: string;
  webhookUrl: string;
  eventTypes: string[];
}

/**
 * Manages PayPal webhook registration and lifecycle
 *
 * According to PayPal Complete Payments integration:
 * 1. Set up Webhooks before generating signup link
 * 2. Required events: MERCHANT.PARTNER-CONSENT.REVOKED, CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED,
 *    PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED
 *
 * @see https://developer.paypal.com/api/rest/webhooks/
 */
export class PayPalWebhookManager {
  private webhooksApi: PayPalWebhooksApi;

  private constructor(webhooksApi: PayPalWebhooksApi) {
    this.webhooksApi = webhooksApi;
  }

  /**
   * Create a webhook manager with partner credentials
   */
  static create(args: {
    clientId: string;
    clientSecret: string;
    env: PayPalEnv;
  }): PayPalWebhookManager {
    const webhooksApi = PayPalWebhooksApi.create({
      clientId: createPayPalClientId(args.clientId),
      clientSecret: createPayPalClientSecret(args.clientSecret),
      env: args.env,
    });

    return new PayPalWebhookManager(webhooksApi);
  }

  /**
   * Register webhook with PayPal
   *
   * Creates a new webhook subscription for platform events.
   * The webhook URL should be the platform's endpoint for receiving PayPal events.
   *
   * @param url - The webhook endpoint URL (e.g., https://app.example.com/api/webhooks/paypal/platform-events)
   * @param eventTypes - Optional list of event types to subscribe to. Defaults to RECOMMENDED_WEBHOOK_EVENTS.
   */
  async registerWebhook(args: {
    url: string;
    eventTypes?: string[];
  }): Promise<Result<WebhookRegistrationResult, Error>> {
    const eventTypes = args.eventTypes || [...RECOMMENDED_WEBHOOK_EVENTS];

    logger.info("Registering PayPal webhook", {
      url: args.url,
      eventTypes,
    });

    const result = await this.webhooksApi.createWebhook({
      url: args.url,
      eventTypes,
    });

    if (result.isErr()) {
      const error = result.error;
      logger.error("Failed to register PayPal webhook", {
        url: args.url,
        error: error instanceof Error ? error.message : JSON.stringify(error),
      });

      // Check if it's an API error with details
      if (typeof error === "object" && error !== null && "name" in error) {
        const apiError = error as { name: string; message: string; details?: unknown };

        // Handle case where webhook already exists
        if (apiError.name === "WEBHOOK_URL_ALREADY_EXISTS") {
          logger.info("Webhook URL already registered, fetching existing webhooks");

          // Try to find existing webhook
          const existingResult = await this.findWebhookByUrl(args.url);
          if (existingResult.isOk() && existingResult.value) {
            return ok(existingResult.value);
          }
        }

        return err(new Error(`PayPal webhook registration failed: ${apiError.name} - ${apiError.message}`));
      }

      return err(
        error instanceof Error ? error : new Error("Failed to register PayPal webhook")
      );
    }

    const webhook = result.value;

    logger.info("PayPal webhook registered successfully", {
      webhookId: webhook.id,
      url: webhook.url,
      eventCount: webhook.event_types.length,
    });

    return ok({
      webhookId: webhook.id,
      webhookUrl: webhook.url,
      eventTypes: webhook.event_types.map((e) => e.name),
    });
  }

  /**
   * Find webhook by URL from existing registrations
   */
  async findWebhookByUrl(url: string): Promise<Result<WebhookRegistrationResult | null, Error>> {
    const listResult = await this.webhooksApi.listWebhooks();

    if (listResult.isErr()) {
      return err(
        listResult.error instanceof Error
          ? listResult.error
          : new Error("Failed to list webhooks")
      );
    }

    const webhooks = listResult.value.webhooks || [];
    const existingWebhook = webhooks.find((w) => w.url === url);

    if (!existingWebhook) {
      return ok(null);
    }

    return ok({
      webhookId: existingWebhook.id,
      webhookUrl: existingWebhook.url,
      eventTypes: existingWebhook.event_types.map((e) => e.name),
    });
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhook(webhookId: string): Promise<Result<void, Error>> {
    logger.info("Deleting PayPal webhook", { webhookId });

    const result = await this.webhooksApi.deleteWebhook({ webhookId });

    if (result.isErr()) {
      logger.error("Failed to delete PayPal webhook", {
        webhookId,
        error: result.error instanceof Error ? result.error.message : JSON.stringify(result.error),
      });

      return err(
        result.error instanceof Error
          ? result.error
          : new Error("Failed to delete PayPal webhook")
      );
    }

    logger.info("PayPal webhook deleted successfully", { webhookId });
    return ok(undefined);
  }

  /**
   * Check if a webhook exists and is active
   */
  async isWebhookActive(webhookId: string): Promise<Result<boolean, Error>> {
    logger.debug("Checking PayPal webhook status", { webhookId });

    const result = await this.webhooksApi.getWebhook({ webhookId });

    if (result.isErr()) {
      // If we get 404, webhook doesn't exist
      const error = result.error;
      if (typeof error === "object" && error !== null && "statusCode" in error) {
        const apiError = error as { statusCode: number };
        if (apiError.statusCode === 404) {
          return ok(false);
        }
      }

      return err(
        error instanceof Error ? error : new Error("Failed to check webhook status")
      );
    }

    // Webhook exists
    return ok(true);
  }

  /**
   * List all registered webhooks
   */
  async listWebhooks(): Promise<
    Result<
      Array<{
        id: string;
        url: string;
        eventTypes: string[];
      }>,
      Error
    >
  > {
    const result = await this.webhooksApi.listWebhooks();

    if (result.isErr()) {
      return err(
        result.error instanceof Error
          ? result.error
          : new Error("Failed to list webhooks")
      );
    }

    const webhooks = result.value.webhooks || [];

    return ok(
      webhooks.map((w) => ({
        id: w.id,
        url: w.url,
        eventTypes: w.event_types.map((e) => e.name),
      }))
    );
  }

  /**
   * Ensure webhook is registered - creates if not exists, returns existing if found
   *
   * This is the main method to use when setting up the platform.
   * It handles the idempotent registration of webhooks.
   */
  async ensureWebhookRegistered(args: {
    url: string;
    eventTypes?: string[];
  }): Promise<Result<WebhookRegistrationResult, Error>> {
    // First check if webhook already exists
    const existingResult = await this.findWebhookByUrl(args.url);

    if (existingResult.isErr()) {
      return err(existingResult.error);
    }

    if (existingResult.value) {
      logger.info("Using existing PayPal webhook", {
        webhookId: existingResult.value.webhookId,
        url: existingResult.value.webhookUrl,
      });
      return ok(existingResult.value);
    }

    // No existing webhook, create new one
    return this.registerWebhook(args);
  }
}
