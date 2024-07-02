import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductVariantDeleted, ProductVariantDeletedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

export const webhookProductVariantDeleted = new SaleorAsyncWebhook<ProductVariantDeleted>({
  webhookPath: "api/webhooks/saleor/product_variant_deleted",
  event: "PRODUCT_VARIANT_DELETED",
  apl: saleorApp.apl,
  query: ProductVariantDeletedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
