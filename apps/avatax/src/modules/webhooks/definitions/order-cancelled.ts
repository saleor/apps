import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { UntypedOrderCancelledSubscriptionDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { OrderCancelledPayload } from "../payloads/order-cancelled-payload";

export const orderCancelledAsyncWebhook = new SaleorAsyncWebhook<OrderCancelledPayload>({
  name: "OrderCancelled",
  apl: saleorApp.apl,
  event: "ORDER_CANCELLED",
  query: UntypedOrderCancelledSubscriptionDocument,
  webhookPath: "/api/webhooks/order-cancelled",
});
