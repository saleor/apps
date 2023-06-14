import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { webhookProductCreated } from "./webhooks/product_created";
import { webhookProductDeleted } from "./webhooks/product_deleted";
import { webhookProductVariantCreated } from "./webhooks/product_variant_created";
import { webhookProductVariantDeleted } from "./webhooks/product_variant_deleted";
import { webhookProductVariantUpdated } from "./webhooks/product_variant_updated";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Product Feed",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_PRODUCTS"],
      id: "saleor.app.product-feed",
      version: packageJson.version,
      webhooks: [
        webhookProductCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantUpdated.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [],
      author: "Saleor Commerce",
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      brand: {
        logo: {
          default: `${context.appBaseUrl}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
