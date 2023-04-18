import { AppManifest } from "@saleor/app-sdk/types";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import packageJson from "../../../package.json";
import { productVariantUpdatedWebhook } from "./webhooks/product-variant-updated";
import { productVariantCreatedWebhook } from "./webhooks/product-variant-created";
import { productVariantDeletedWebhook } from "./webhooks/product-variant-deleted";
import { productUpdatedWebhook } from "./webhooks/product-updated";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "CMS",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_PRODUCTS"],
      id: "saleor.app.cms",
      version: packageJson.version,
      webhooks: [
        productVariantCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantDeletedWebhook.getWebhookManifest(context.appBaseUrl),
        productUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [],
      author: "Saleor Commerce",
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
    };

    return manifest;
  },
});
