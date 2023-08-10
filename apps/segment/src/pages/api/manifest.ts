import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about: "TODO",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      /*
       * brand: {
       *   logo: {
       *     default: `${apiBaseURL}/logo.png`,
       *   },
       * },
       */
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [
        /**
         * Optionally, extend Dashboard with custom UIs
         * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
         */
      ],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.segmentio",
      name: "Segment.io",
      permissions: ["MANAGE_ORDERS"],
      requiredSaleorVersion: ">=3.10 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      /*
       * TODO optimize - create webhooks dynamically, otherwise app will generate traffic not being configured first
       */
      webhooks: [orderCreatedWebhook.getWebhookManifest(appBaseUrl)],
    };

    return manifest;
  },
});
