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
      about: "Generate feeds consumed by Merchant Platforms",
      appUrl: context.appBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${context.appBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.product-feed",
      name: "Product Feed",
      permissions: ["MANAGE_PRODUCTS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [
        webhookProductCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantUpdated.getWebhookManifest(context.appBaseUrl),
      ],
    };

    return manifest;
  },
});
