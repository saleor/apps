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
  });
