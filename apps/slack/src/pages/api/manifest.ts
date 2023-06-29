import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";

const handler = createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      about:
        "Saleor Slack integration allows you to get notifications on Slack channel from Saleor events.",
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
      id: "saleor.app.slack",
      name: "Slack",
      permissions: ["MANAGE_ORDERS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [orderCreatedWebhook.getWebhookManifest(context.appBaseUrl)],
    };

    return manifest;
  },
});

export default handler;
