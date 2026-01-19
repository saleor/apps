import { Result, ResultAsync } from "neverthrow";

import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";

/**
 * PayPal Webhook
 */
export interface PayPalWebhook {
  id: string;
  url: string;
  event_types: Array<{
    name: string;
    description?: string;
    status?: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * PayPal Webhooks API
 *
 * Manages webhook subscriptions for receiving event notifications from PayPal.
 *
 * @see https://developer.paypal.com/api/rest/webhooks/
 */
export class PayPalWebhooksApi {
  private client: PayPalClient;

  private constructor(client: PayPalClient) {
    this.client = client;
  }

  static create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): PayPalWebhooksApi {
    const client = PayPalClient.create(args);
    return new PayPalWebhooksApi(client);
  }

  /**
   * Create Webhook
   *
   * Subscribe to webhook events from PayPal.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks_post
   */
  async createWebhook(args: {
    url: string;
    eventTypes: string[];
  }): Promise<Result<PayPalWebhook, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalWebhook>({
        method: "POST",
        path: "/v1/notifications/webhooks",
        body: {
          url: args.url,
          event_types: args.eventTypes.map((name) => ({ name })),
        },
      }),
      (error) => error,
    );
  }

  /**
   * List Webhooks
   *
   * Lists all webhooks for an app.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks_list
   */
  async listWebhooks(): Promise<
    Result<
      {
        webhooks: PayPalWebhook[];
      },
      unknown
    >
  > {
    return ResultAsync.fromPromise(
      this.client.makeRequest<{
        webhooks: PayPalWebhook[];
      }>({
        method: "GET",
        path: "/v1/notifications/webhooks",
      }),
      (error) => error,
    );
  }

  /**
   * Get Webhook
   *
   * Shows details for a webhook, by ID.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks_get
   */
  async getWebhook(args: { webhookId: string }): Promise<Result<PayPalWebhook, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalWebhook>({
        method: "GET",
        path: `/v1/notifications/webhooks/${args.webhookId}`,
      }),
      (error) => error,
    );
  }

  /**
   * Update Webhook
   *
   * Updates a webhook to replace webhook fields with new values.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks_update
   */
  async updateWebhook(args: {
    webhookId: string;
    operations: Array<{
      op: "add" | "replace" | "remove";
      path: string;
      value?: any;
    }>;
  }): Promise<Result<PayPalWebhook, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalWebhook>({
        method: "PATCH",
        path: `/v1/notifications/webhooks/${args.webhookId}`,
        body: args.operations,
      }),
      (error) => error,
    );
  }

  /**
   * Delete Webhook
   *
   * Deletes a webhook, by ID.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks_delete
   */
  async deleteWebhook(args: { webhookId: string }): Promise<Result<void, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<void>({
        method: "DELETE",
        path: `/v1/notifications/webhooks/${args.webhookId}`,
      }),
      (error) => error,
    );
  }

  /**
   * List Available Event Types
   *
   * Lists all webhook event types that are available for subscription.
   *
   * @see https://developer.paypal.com/api/rest/webhooks/rest/#webhooks-event-types_list
   */
  async listEventTypes(): Promise<
    Result<
      {
        event_types: Array<{
          name: string;
          description: string;
          status?: string;
        }>;
      },
      unknown
    >
  > {
    return ResultAsync.fromPromise(
      this.client.makeRequest<{
        event_types: Array<{
          name: string;
          description: string;
          status?: string;
        }>;
      }>({
        method: "GET",
        path: "/v1/notifications/webhooks-event-types",
      }),
      (error) => error,
    );
  }
}

/**
 * Recommended webhook events for PayPal Complete Payments integration
 */
export const RECOMMENDED_WEBHOOK_EVENTS = [
  "MERCHANT.PARTNER-CONSENT.REVOKED", // Merchant revokes permissions
  "CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED", // Vetting status changes
  "PAYMENT.CAPTURE.COMPLETED", // Payment captured
  "PAYMENT.CAPTURE.DENIED", // Payment capture failed
  "PAYMENT.CAPTURE.REFUNDED", // Refund processed
  "PAYMENT.CAPTURE.REVERSED", // Chargeback
  "PAYMENT.AUTHORIZATION.CREATED", // Authorization created
  "PAYMENT.AUTHORIZATION.VOIDED", // Authorization voided
] as const;
