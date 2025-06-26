import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import { ProductVariantUpdatedEventFragment } from "../../../generated/graphql";
import { apl } from "../../saleor-app";

export const variantUpdatedWebhookManifest =
  new SaleorAsyncWebhook<ProductVariantUpdatedEventFragment>({
    query: "todo",
    apl: apl,
    name: "Product Variant Updated",
    event: "PRODUCT_VARIANT_UPDATED",
    webhookPath: "variant-updated",
    isActive: true,
  });
