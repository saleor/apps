import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { ProductVariantUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type ProductVariantUpdated } from "../../lib/webhook-event-types";

export const webhookProductVariantUpdated = new SaleorAsyncWebhook<ProductVariantUpdated>({
  webhookPath: "api/webhooks/saleor/product_variant_updated",
  event: "PRODUCT_VARIANT_UPDATED",
  apl: saleorApp.apl,
  query: ProductVariantUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
