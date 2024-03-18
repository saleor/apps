import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedOrderConfirmedSubscriptionDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { OrderConfirmedPayload } from "../payloads/order-confirmed-payload";

export const orderConfirmedAsyncWebhook = new SaleorAsyncWebhook<OrderConfirmedPayload>({
  name: "OrderConfirmed",
  apl: saleorApp.apl,
  event: "ORDER_CONFIRMED",
  query: UntypedOrderConfirmedSubscriptionDocument,
  webhookPath: "/api/webhooks/order-confirmed",
});
