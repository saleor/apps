import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { customerCreatedWebhook } from "./webhooks/customer-created";
import { customerMetadataUpdatedWebhook } from "./webhooks/customer-updated";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      name: "CRM",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      appUrl: iframeBaseUrl,
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
        customerCreatedWebhook.getWebhookManifest(apiBaseURL),
        customerMetadataUpdatedWebhook.getWebhookManifest(apiBaseURL),
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
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
