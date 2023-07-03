import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { webhookProductCreated } from "./webhooks/saleor/product_created";
import { webhookProductDeleted } from "./webhooks/saleor/product_deleted";
import { webhookProductUpdated } from "./webhooks/saleor/product_updated";
import { webhookProductVariantCreated } from "./webhooks/saleor/product_variant_created";
import { webhookProductVariantDeleted } from "./webhooks/saleor/product_variant_deleted";
import { webhookProductVariantUpdated } from "./webhooks/saleor/product_variant_updated";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "Search App is a multi-integration app that connects your Saleor store with search engines.",
      appUrl: iframeBaseUrl,
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
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
      id: "saleor.app.search",
      name: "Search",
      permissions: [
        /**
         * Set permissions for app if needed
         * https://docs.saleor.io/docs/3.x/developer/permissions
         */
        "MANAGE_PRODUCTS",
        "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
      ],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [
        /**
         * Configure webhooks here. They will be created in Saleor during installation
         * Read more
         * https://docs.saleor.io/docs/3.x/developer/api-reference/objects/webhook
         */
        webhookProductCreated.getWebhookManifest(apiBaseURL),
        webhookProductDeleted.getWebhookManifest(apiBaseURL),
        webhookProductUpdated.getWebhookManifest(apiBaseURL),
        webhookProductVariantCreated.getWebhookManifest(apiBaseURL),
        webhookProductVariantDeleted.getWebhookManifest(apiBaseURL),
        webhookProductVariantUpdated.getWebhookManifest(apiBaseURL),
      ],
    };

    return manifest;
  },
});
