import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderConfirmedDocument,
  OrderConfirmedSubscriptionPayloadFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderConfirmedAsyncWebhook =
  new SaleorAsyncWebhook<OrderConfirmedSubscriptionPayloadFragment>({
    name: "Order Confirmed",
    webhookPath: "api/webhooks/order-confirmed",
    event: "ORDER_CONFIRMED",
    apl: saleorApp.apl,
    query: OrderConfirmedDocument,
    /**
     * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
     */
    isActive: false,
  });
