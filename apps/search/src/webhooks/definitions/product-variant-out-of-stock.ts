import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { ProductVariantOutOfStockDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type ProductVariantOutOfStock } from "../../lib/webhook-event-types";

export const webhookProductVariantOutOfStock = new SaleorAsyncWebhook<ProductVariantOutOfStock>({
  webhookPath: "api/webhooks/saleor/product_variant_out_of_stock",
  event: "PRODUCT_VARIANT_OUT_OF_STOCK",
  apl: saleorApp.apl,
  query: ProductVariantOutOfStockDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
