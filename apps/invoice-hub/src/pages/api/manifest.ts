import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { invoiceRequestedWebhook } from "./webhooks/invoice-requested";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: packageJson.name,
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "app.saleor.invoices",
      version: packageJson.version,
      webhooks: [invoiceRequestedWebhook.getWebhookManifest(context.appBaseUrl)],
      extensions: [],
    };

    return manifest;
  },
});
