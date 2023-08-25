import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductCreated, ProductCreatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

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
