import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { OrderConfirmedSubscription } from "../../../../graphql/subscriptions/OrderConfirmed";
import { saleorApp } from "../../../../saleor-app";
import { OrderConfirmedPayload } from "../payloads/order-confirmed-payload";

export const orderConfirmedAsyncWebhook = new SaleorAsyncWebhook<OrderConfirmedPayload>({
  name: "OrderConfirmed",
  apl: saleorApp.apl,
  event: "ORDER_CONFIRMED",
  query: OrderConfirmedSubscription,
  webhookPath: "/api/webhooks/order-confirmed",
});
