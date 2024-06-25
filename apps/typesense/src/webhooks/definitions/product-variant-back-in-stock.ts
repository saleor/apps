import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductVariantBackInStock,
  ProductVariantBackInStockDocument,
} from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

export const webhookProductVariantBackInStock = new SaleorAsyncWebhook<ProductVariantBackInStock>({
  webhookPath: "api/webhooks/saleor/product_variant_back_in_stock",
  event: "PRODUCT_VARIANT_BACK_IN_STOCK",
  apl: saleorApp.apl,
  query: ProductVariantBackInStockDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
