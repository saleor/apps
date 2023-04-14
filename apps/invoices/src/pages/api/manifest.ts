import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { invoiceRequestedWebhook } from "./webhooks/invoice-requested";

export const REQUIRED_SALEOR_VERSION = ">=3.10 <4";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Invoices",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app.invoices",
      version: packageJson.version,
      webhooks: [invoiceRequestedWebhook.getWebhookManifest(context.appBaseUrl)],
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      supportUrl: "https://github.com/saleor/apps/discussions",
      author: "Saleor Commerce",
      /**
       * Requires 3.10 due to invoices event payload - in previous versions, order reference was missing
       */
      requiredSaleorVersion: REQUIRED_SALEOR_VERSION,
    };

    return manifest;
  },
});
