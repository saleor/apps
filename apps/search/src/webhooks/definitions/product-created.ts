import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { ProductCreatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type ProductCreated } from "../../lib/webhook-event-types";

export const webhookProductCreated = new SaleorAsyncWebhook<ProductCreated>({
  webhookPath: "api/webhooks/saleor/product_created",
  event: "PRODUCT_CREATED",
  apl: saleorApp.apl,
  query: ProductCreatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
