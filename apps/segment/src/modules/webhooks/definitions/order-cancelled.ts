import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderCancelledDocument,
  OrderUpdatedSubscriptionPayloadFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderCancelledAsyncWebhook =
  new SaleorAsyncWebhook<OrderUpdatedSubscriptionPayloadFragment>({
    name: "Order Cancelled",
    webhookPath: "api/webhooks/order-cancelled",
    event: "ORDER_CANCELLED",
    apl: saleorApp.apl,
    query: OrderCancelledDocument,
    /**
     * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
     */
    isActive: false,
  });
