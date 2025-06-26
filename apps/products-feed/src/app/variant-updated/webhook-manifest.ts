import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { apl } from "../../saleor-app";

export const variantUpdatedWebhookManifest = new SaleorAsyncWebhook({
  query: "todo",
  apl: apl,
  name: "Product Variant Updated",
  event: "PRODUCT_VARIANT_UPDATED",
  webhookPath: "variant-updated",
  isActive: true,
});
