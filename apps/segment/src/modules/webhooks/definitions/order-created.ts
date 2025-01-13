import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { OrderCreatedDocument, OrderCreatedSubscriptionPayloadFragment } from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderCreatedAsyncWebhook =
  new SaleorAsyncWebhook<OrderCreatedSubscriptionPayloadFragment>({
    name: "Order Created",
    webhookPath: "api/webhooks/order-created",
    event: "ORDER_CREATED",
    apl: saleorApp.apl,
    query: OrderCreatedDocument,
    /**
     * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
     */
    isActive: false,
  });
