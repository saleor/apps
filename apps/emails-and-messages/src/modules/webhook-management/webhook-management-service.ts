import { invoiceSentWebhook } from "../../pages/api/webhooks/invoice-sent";
import { orderCancelledWebhook } from "../../pages/api/webhooks/order-cancelled";
import { orderConfirmedWebhook } from "../../pages/api/webhooks/order-confirmed";
import { orderCreatedWebhook } from "../../pages/api/webhooks/order-created";
import { orderFulfilledWebhook } from "../../pages/api/webhooks/order-fulfilled";
import { orderFullyPaidWebhook } from "../../pages/api/webhooks/order-fully-paid";
import { Client } from "urql";
import { createAppWebhook, deleteAppWebhook, fetchAppWebhooks } from "./api-operations";
import { notifyWebhook } from "../../pages/api/webhooks/notify";
import { MessageEventTypes } from "../event-handlers/message-event-types";
import { WebhookEventTypeAsyncEnum } from "../../../generated/graphql";
import { giftCardSentWebhook } from "../../pages/api/webhooks/gift-card-sent";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";
import { orderRefundedWebhook } from "../../pages/api/webhooks/order-refunded";
import { createLogger } from "../../logger";

export const AppWebhooks = {
  giftCardSentWebhook,
  invoiceSentWebhook,
  notifyWebhook,
  orderCancelledWebhook,
  orderConfirmedWebhook,
  orderCreatedWebhook,
  orderFulfilledWebhook,
  orderFullyPaidWebhook,
  orderRefundedWebhook,
};

export type AppWebhook = keyof typeof AppWebhooks;

export const eventToWebhookMapping: Record<MessageEventTypes, AppWebhook> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: "notifyWebhook",
  ACCOUNT_CHANGE_EMAIL_REQUEST: "notifyWebhook",
  ACCOUNT_CONFIRMATION: "notifyWebhook",
  ACCOUNT_DELETE: "notifyWebhook",
  ACCOUNT_PASSWORD_RESET: "notifyWebhook",
  GIFT_CARD_SENT: "giftCardSentWebhook",
  INVOICE_SENT: "invoiceSentWebhook",
  ORDER_CANCELLED: "orderCancelledWebhook",
  ORDER_CONFIRMED: "orderConfirmedWebhook",
  ORDER_CREATED: "orderCreatedWebhook",
  ORDER_FULFILLED: "orderFulfilledWebhook",
  ORDER_FULLY_PAID: "orderFullyPaidWebhook",
  ORDER_REFUNDED: "orderRefundedWebhook",
  ORDER_FULFILLMENT_UPDATE: "notifyWebhook",
};

const logger = createLogger("WebhookManagementService");

export class WebhookManagementService {
  private appBaseUrl: string;
  private client: Client;
  private featureFlagService: FeatureFlagService;

  constructor(args: {
    appBaseUrl: string;
    client: Client;
    featureFlagService: FeatureFlagService;
  }) {
    this.appBaseUrl = args.appBaseUrl;
    this.client = args.client;
    this.featureFlagService = args.featureFlagService;
  }

  // Returns list of webhooks registered for the App in the Saleor instance
  public async getWebhooks() {
    logger.debug("Fetching webhooks");
    return await fetchAppWebhooks({ client: this.client });
  }

  /**
   * Returns a dictionary with webhooks status.
   * Status equal to true means that webhook is created and active.
   */
  public async getWebhooksStatus() {
    logger.debug("Fetching webhooks status");
    const webhooks = await this.getWebhooks();

    return Object.fromEntries(
      Object.keys(AppWebhooks).map((webhook) => {
        const webhookData = webhooks.find(
          (w) => w.name === AppWebhooks[webhook as AppWebhook].name,
        );

        return [webhook as AppWebhook, Boolean(webhookData?.isActive)];
      }),
    );
  }

  public async createWebhook({ webhook }: { webhook: AppWebhook }) {
    const flags = await this.featureFlagService.getFeatureFlags();

    if (!flags.giftCardSentEvent && webhook === "giftCardSentWebhook") {
      logger.error(`Attempt to activate Gift Card Sent webhook despite unsupported environment`);
      throw new Error("Gift card event is not supported in this environment");
    }

    const webhookManifest = AppWebhooks[webhook].getWebhookManifest(this.appBaseUrl);

    const asyncWebhooks = webhookManifest.asyncEvents;

    if (!asyncWebhooks?.length) {
      logger.warn(`Webhook ${webhook} has no async events`);
      throw new Error("Only the webhooks with async events can be registered");
    }

    await createAppWebhook({
      client: this.client,
      variables: {
        asyncEvents: asyncWebhooks as WebhookEventTypeAsyncEnum[],
        isActive: true,
        name: webhookManifest.name,
        targetUrl: webhookManifest.targetUrl,
        // Override empty queries to handle NOTIFY webhook
        query: webhookManifest.query === "{}" ? undefined : webhookManifest.query,
      },
    });
  }

  public async deleteWebhook({ webhook }: { webhook: AppWebhook }): Promise<void> {
    logger.debug(`Deleting webhook ${webhook}`);
    logger.debug(`Fetching existing webhooks`);
    const webhookData = await this.getWebhooks();

    const id = webhookData.find((w) => w.name === AppWebhooks[webhook].name)?.id;

    if (!id) {
      logger.error(`Webhook ${AppWebhooks[webhook].name} was not registered yet`);
      throw new Error(`Webhook ${AppWebhooks[webhook].name} was not registered yet`);
    }

    logger.debug(`Running delete mutation`);
    await deleteAppWebhook({
      client: this.client,
      id,
    });
  }
}
