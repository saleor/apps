import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { invoiceRequestedWebhook } from "./webhooks/invoice-requested";
import { REQUIRED_SALEOR_VERSION } from "../../saleor-app";

export default createManifestHandler({
  async manifestFactory(context) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? context.appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? context.appBaseUrl;

    const manifest: AppManifest = {
      name: "Invoices",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      appUrl: iframeBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app.invoices",
      version: packageJson.version,
      webhooks: [invoiceRequestedWebhook.getWebhookManifest(apiBaseURL)],
      extensions: [],
      supportUrl: "https://github.com/saleor/apps/discussions",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      /**
       * Requires 3.10 due to invoices event payload - in previous versions, order reference was missing
       */
      requiredSaleorVersion: REQUIRED_SALEOR_VERSION,
    };

    return manifest;
  },
});
