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
      about:
        "CMS App is a multi-integration app that connects Saleor with popular Content Management Systems.",
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
      id: "saleor.app.cms",
      name: "CMS",
      permissions: ["MANAGE_PRODUCTS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [
        productVariantCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantDeletedWebhook.getWebhookManifest(context.appBaseUrl),
        productUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
      ],
    };

    return manifest;
  },
});
