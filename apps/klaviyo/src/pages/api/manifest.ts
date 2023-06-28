import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import pkg from "../../../package.json";
import { customerCreatedWebhook } from "./webhooks/customer-created";
import { fulfillmentCreatedWebhook } from "./webhooks/fulfillment-created";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { orderFullyPaidWebhook } from "./webhooks/order-fully-paid";

const handler = createManifestHandler({
  async manifestFactory(context): Promise<AppManifest> {
    const { appBaseUrl } = context;

    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    return {
      id: "saleor.app.klaviyo",
      version: pkg.version,
      name: "Klaviyo",
      permissions: ["MANAGE_USERS", "MANAGE_ORDERS"],
      appUrl: iframeBaseUrl,
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      webhooks: [
        customerCreatedWebhook.getWebhookManifest(apiBaseURL),
        fulfillmentCreatedWebhook.getWebhookManifest(apiBaseURL),
        orderCreatedWebhook.getWebhookManifest(apiBaseURL),
        orderFullyPaidWebhook.getWebhookManifest(apiBaseURL),
      ],
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };
  },
});

export default handler;
