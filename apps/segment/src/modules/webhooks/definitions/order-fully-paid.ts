import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderFullyPaidDocument,
  OrderFullyPaidSubscriptionPayloadFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderFullyPaidAsyncWebhook =
  new SaleorAsyncWebhook<OrderFullyPaidSubscriptionPayloadFragment>({
    name: "Order Fully Paid",
    webhookPath: "api/webhooks/order-fully-paid",
    event: "ORDER_FULLY_PAID",
    apl: saleorApp.apl,
    query: OrderFullyPaidDocument,
    /**
     * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
     */
    isActive: false,
  });
