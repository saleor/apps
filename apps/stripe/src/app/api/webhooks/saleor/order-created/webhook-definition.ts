import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { OrderCreatedDocument, type OrderCreatedEventFragment } from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

/**
 * Requires MANAGE_ORDERS. Installations that were created before it was added to the manifest
 * don't have this webhook until the permission is granted from the app UI (see `order-sync` module).
 */
export const orderCreatedWebhookDefinition = new SaleorAsyncWebhook<OrderCreatedEventFragment>({
  apl: saleorApp.apl,
  event: "ORDER_CREATED",
  name: "Stripe Order Created",
  isActive: true,
  query: OrderCreatedDocument,
  webhookPath: "api/webhooks/saleor/order-created",
});
