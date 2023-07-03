import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { invoiceRequestedWebhook } from "./webhooks/invoice-requested";
import { REQUIRED_SALEOR_VERSION } from "../../saleor-app";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "An app that generates PDF invoices for Orders and stores them in Saleor file storage.",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.invoices",
      name: "Invoices",
      permissions: ["MANAGE_ORDERS"],
      /**
       * Requires 3.10 due to invoices event payload - in previous versions, order reference was missing
       */
      requiredSaleorVersion: REQUIRED_SALEOR_VERSION,
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [invoiceRequestedWebhook.getWebhookManifest(apiBaseURL)],
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
