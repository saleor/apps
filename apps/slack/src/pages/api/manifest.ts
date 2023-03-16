import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";

const handler = createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Slack",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app.slack",
      version: packageJson.version,
      webhooks: [orderCreatedWebhook.getWebhookManifest(context.appBaseUrl)],
      extensions: [],
      author: "Saleor Commerce",
    };

    return manifest;
  },
});

export default handler;
