import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      name: "Slack",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      appUrl: iframeBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app.slack",
      version: packageJson.version,
      webhooks: [orderCreatedWebhook.getWebhookManifest(apiBaseURL)],
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

export default handler;
