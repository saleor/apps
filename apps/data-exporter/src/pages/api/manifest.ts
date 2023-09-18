import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { webhookProductCreated } from "./webhooks/product_created";
import { webhookProductDeleted } from "./webhooks/product_deleted";
import { webhookProductVariantCreated } from "./webhooks/product_variant_created";
import { webhookProductVariantDeleted } from "./webhooks/product_variant_deleted";
import { webhookProductVariantUpdated } from "./webhooks/product_variant_updated";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const popupUrl = new URL("/popup", apiBaseURL).href;
    const pageUrl = "/page"; //new URL("/page", apiBaseURL).href;

    const manifest: AppManifest = {
      about: "Generate feeds consumed by Merchant Platforms",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [
        {
          label: "Export orders popup",
          mount: "ORDER_OVERVIEW_MORE_ACTIONS",
          target: "POPUP",
          permissions: ["MANAGE_ORDERS"],
          url: popupUrl,
        },
        {
          label: "Export orders page",
          mount: "ORDER_OVERVIEW_MORE_ACTIONS",
          target: "APP_PAGE",
          permissions: ["MANAGE_ORDERS"],
          url: pageUrl,
        },
      ],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.data-exporter",
      name: "Data Exporter",
      permissions: ["MANAGE_PRODUCTS", "MANAGE_ORDERS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: [
        webhookProductCreated.getWebhookManifest(apiBaseURL),
        webhookProductDeleted.getWebhookManifest(apiBaseURL),
        webhookProductVariantCreated.getWebhookManifest(apiBaseURL),
        webhookProductVariantDeleted.getWebhookManifest(apiBaseURL),
        webhookProductVariantUpdated.getWebhookManifest(apiBaseURL),
      ],
    };

    return manifest;
  },
});
