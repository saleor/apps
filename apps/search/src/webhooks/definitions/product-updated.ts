import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductUpdated, ProductUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

export const webhookProductUpdated = new SaleorAsyncWebhook<ProductUpdated>({
  webhookPath: "api/webhooks/saleor/product_updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: ProductUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
