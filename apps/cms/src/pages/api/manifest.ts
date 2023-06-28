import { AppManifest } from "@saleor/app-sdk/types";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import packageJson from "../../../package.json";
import { productVariantUpdatedWebhook } from "./webhooks/product-variant-updated";
import { productVariantCreatedWebhook } from "./webhooks/product-variant-created";
import { productVariantDeletedWebhook } from "./webhooks/product-variant-deleted";
import { productUpdatedWebhook } from "./webhooks/product-updated";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      name: "CMS",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      appUrl: iframeBaseUrl,
      permissions: ["MANAGE_PRODUCTS"],
      id: "saleor.app.cms",
      version: packageJson.version,
      webhooks: [
        productVariantCreatedWebhook.getWebhookManifest(apiBaseURL),
        productVariantUpdatedWebhook.getWebhookManifest(apiBaseURL),
        productVariantDeletedWebhook.getWebhookManifest(apiBaseURL),
        productUpdatedWebhook.getWebhookManifest(apiBaseURL),
      ],
      extensions: [],
      author: "Saleor Commerce",
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
