import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { customerCreatedWebhook } from "./webhooks/customer-created";
import { customerMetadataUpdatedWebhook } from "./webhooks/customer-updated";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      about: "CRM App allows synchronization of customers from Saleor to other platforms",
      appUrl: context.appBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${context.appBaseUrl}/logo.png`,
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
      id: "saleor.app.crm",
      name: "CRM",
      permissions: [
        "MANAGE_USERS",
        /**
         * Set permissions for app if needed
         * https://docs.saleor.io/docs/3.x/developer/permissions
         */
      ],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [
        customerCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        customerMetadataUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
      ],
    };

    return manifest;
  },
});
