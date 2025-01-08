import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { OrderUpdatedDocument, OrderUpdatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderUpdatedAsyncWebhook =
  new SaleorAsyncWebhook<OrderUpdatedSubscriptionPayloadFragment>({
    name: "Order Updated",
    webhookPath: "api/webhooks/order-updated",
    event: "ORDER_UPDATED",
    apl: saleorApp.apl,
    query: OrderUpdatedDocument,
    /**
     * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
     */
    isActive: false,
  });
