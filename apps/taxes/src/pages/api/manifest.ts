import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { checkoutCalculateTaxesSyncWebhook } from "./webhooks/checkout-calculate-taxes";
import { orderCalculateTaxesSyncWebhook } from "./webhooks/order-calculate-taxes";
import { orderConfirmedAsyncWebhook } from "./webhooks/order-confirmed";
import { REQUIRED_SALEOR_VERSION } from "../../../saleor-app";
import { orderCancelledAsyncWebhook } from "./webhooks/order-cancelled";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about: "Taxes App allows dynamic taxes calculations for orders",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.taxes",
      name: "Taxes",
      permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
      requiredSaleorVersion: REQUIRED_SALEOR_VERSION,
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [
        orderCalculateTaxesSyncWebhook.getWebhookManifest(apiBaseURL),
        checkoutCalculateTaxesSyncWebhook.getWebhookManifest(apiBaseURL),
        orderConfirmedAsyncWebhook.getWebhookManifest(apiBaseURL),
        orderCancelledAsyncWebhook.getWebhookManifest(apiBaseURL),
      ],
    };

    return manifest;
  },
});
