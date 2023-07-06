import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { productVariantCreatedWebhook } from "./webhooks/product-variant-created";
import { productVariantUpdatedWebhook } from "./webhooks/product-variant-updated";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about: "TODO",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [
        /**
         * Optionally, extend Dashboard with custom UIs
         * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
         */
      ],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.cms2",
      name: "CMS",
      permissions: ["MANAGE_PRODUCTS"],
      requiredSaleorVersion: ">=3.10 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [
        // TODO optimize - create webhooks dynamically
        productVariantCreatedWebhook.getWebhookManifest(apiBaseURL),
        productVariantUpdatedWebhook.getWebhookManifest(apiBaseURL),
      ],
    };

    return manifest;
  },
});
