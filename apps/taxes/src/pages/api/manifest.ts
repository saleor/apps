import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { checkoutCalculateTaxesSyncWebhook } from "./webhooks/checkout-calculate-taxes";
import { orderCalculateTaxesSyncWebhook } from "./webhooks/order-calculate-taxes";
import { orderCreatedAsyncWebhook } from "./webhooks/order-created";
import { orderFulfilledAsyncWebhook } from "./webhooks/order-fulfilled";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Taxes",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
      id: "saleor.app.taxes",
      version: packageJson.version,
      webhooks: [
        orderCalculateTaxesSyncWebhook.getWebhookManifest(context.appBaseUrl),
        checkoutCalculateTaxesSyncWebhook.getWebhookManifest(context.appBaseUrl),
        orderCreatedAsyncWebhook.getWebhookManifest(context.appBaseUrl),
        orderFulfilledAsyncWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      supportUrl: "https://github.com/saleor/apps/discussions",
      author: "Saleor Commerce",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
    };

    return manifest;
  },
});
