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
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "Search",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: [
        /**
         * Set permissions for app if needed
         * https://docs.saleor.io/docs/3.x/developer/permissions
         */
        "MANAGE_PRODUCTS",
        "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
      ],
      id: "saleor.app.search",
      version: packageJson.version,
      webhooks: [
        /**
         * Configure webhooks here. They will be created in Saleor during installation
         * Read more
         * https://docs.saleor.io/docs/3.x/developer/api-reference/objects/webhook
         */
        webhookProductCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductUpdated.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantCreated.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantDeleted.getWebhookManifest(context.appBaseUrl),
        webhookProductVariantUpdated.getWebhookManifest(context.appBaseUrl),
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
    };

    return manifest;
  },
});
