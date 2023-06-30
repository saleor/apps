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

    return {
      about:
        "Klaviyo integration allows sending Klaviyo notifications on Saleor events.",
      appUrl: appBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${context.appBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.klaviyo",
      name: "Klaviyo",
      permissions: ["MANAGE_USERS", "MANAGE_ORDERS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${appBaseUrl}/api/register`,
      version: pkg.version,
      webhooks: [
        customerCreatedWebhook.getWebhookManifest(appBaseUrl),
        fulfillmentCreatedWebhook.getWebhookManifest(appBaseUrl),
        orderCreatedWebhook.getWebhookManifest(appBaseUrl),
        orderFullyPaidWebhook.getWebhookManifest(appBaseUrl),
      ],
    };
  },
});

export default handler;
