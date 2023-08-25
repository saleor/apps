import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductDeleted, ProductDeletedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

export const webhookProductDeleted = new SaleorAsyncWebhook<ProductDeleted>({
  webhookPath: "api/webhooks/saleor/product_deleted",
  event: "PRODUCT_DELETED",
  apl: saleorApp.apl,
  query: ProductDeletedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
