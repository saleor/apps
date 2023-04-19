import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { orderFulfilledWebhook } from "./webhooks/order-fulfilled";
import { orderConfirmedWebhook } from "./webhooks/order-confirmed";
import { orderCancelledWebhook } from "./webhooks/order-cancelled";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";
import { invoiceSentWebhook } from "./webhooks/invoice-sent";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Emails & Messages",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_ORDERS", "MANAGE_USERS"],
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
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      author: "Saleor Commerce",
      /**
       * Requires 3.10 due to invoices event payload - in previous versions, order reference was missing
       */
      requiredSaleorVersion: ">=3.10 <4",
    };

    return manifest;
  },
});
