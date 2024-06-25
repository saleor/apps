import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductVariantUpdated, ProductVariantUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

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
