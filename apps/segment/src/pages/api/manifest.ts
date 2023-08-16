import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { orderUpdatedWebhook } from "./webhooks/order-updated";
import { orderCancelledWebhook } from "./webhooks/order-cancelled";
import { orderRefundedWebhook } from "./webhooks/order-refunded";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about: "Seamlessly feed Segment with Saleor events",
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
      id: "saleor.app.segment",
      name: "Twilio Segment",
      permissions: ["MANAGE_ORDERS"],
      requiredSaleorVersion: ">=3.14 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      /*
       * TODO Add webhooks disabled and enable then when configured
       */
      webhooks: [
        orderCreatedWebhook.getWebhookManifest(appBaseUrl),
        orderUpdatedWebhook.getWebhookManifest(appBaseUrl),
        orderCancelledWebhook.getWebhookManifest(appBaseUrl),
        orderRefundedWebhook.getWebhookManifest(appBaseUrl),
        orderFullyPaidWebhook.getWebhookManifest(appBaseUrl),
      ],
    };

    return manifest;
  },
});
