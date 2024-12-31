import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderRefundedDocument,
  OrderRefundedSubscriptionPayloadFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/saleor-app";

export const orderRefundedAsyncWebhook =
  new SaleorAsyncWebhook<OrderRefundedSubscriptionPayloadFragment>({
    name: "Order Refunded",
    webhookPath: "api/webhooks/order-refunded",
    event: "ORDER_REFUNDED",
    apl: saleorApp.apl,
    query: OrderRefundedDocument,
  });
