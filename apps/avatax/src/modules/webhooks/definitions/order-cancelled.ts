import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { OrderCancelledSubscription } from "../../../../graphql/subscriptions/OrderCancelled";
import { saleorApp } from "../../../../saleor-app";
import { OrderCancelledPayload } from "../payloads/order-cancelled-payload";

export const orderCancelledAsyncWebhook = new SaleorAsyncWebhook<OrderCancelledPayload>({
  name: "OrderCancelled",
  apl: saleorApp.apl,
  event: "ORDER_CANCELLED",
  query: OrderCancelledSubscription,
  webhookPath: "/api/webhooks/order-cancelled",
});
