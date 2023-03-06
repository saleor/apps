import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { invoiceSentWebhook } from "./webhooks/invoice-sent";
import { orderCancelledWebhook } from "./webhooks/order-cancelled";
import { orderConfirmedWebhook } from "./webhooks/order-confirmed";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { orderFulfilledWebhook } from "./webhooks/order-fulfilled";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Emails & Messages",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app.emails-and-messages",
      version: packageJson.version,
      webhooks: [
        orderCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        orderFulfilledWebhook.getWebhookManifest(context.appBaseUrl),
        orderConfirmedWebhook.getWebhookManifest(context.appBaseUrl),
        orderCancelledWebhook.getWebhookManifest(context.appBaseUrl),
        orderFullyPaidWebhook.getWebhookManifest(context.appBaseUrl),
        invoiceSentWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [
        /**
         * Optionally, extend Dashboard with custom UIs
         * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
         */
      ],
    };

    return manifest;
  },
});
