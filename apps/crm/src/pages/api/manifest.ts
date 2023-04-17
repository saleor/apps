import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { customerCreatedWebhook } from "./webhooks/customer-created";
import { customerMetadataUpdatedWebhook } from "./webhooks/customer-updated";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "CRM",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: [
        "MANAGE_USERS",
        /**
         * Set permissions for app if needed
         * https://docs.saleor.io/docs/3.x/developer/permissions
         */
      ],
      id: "saleor.app.crm",
      version: packageJson.version,
      webhooks: [
        customerCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        customerMetadataUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
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
    };

    return manifest;
  },
});
