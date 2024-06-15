import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductVariantCreated, ProductVariantCreatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

export const webhookProductVariantCreated = new SaleorAsyncWebhook<ProductVariantCreated>({
  webhookPath: "api/webhooks/saleor/product_variant_created",
  event: "PRODUCT_VARIANT_CREATED",
  apl: saleorApp.apl,
  query: ProductVariantCreatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
