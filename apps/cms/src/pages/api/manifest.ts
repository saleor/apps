import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import packageJson from "../../../package.json";
import { loggerContext } from "../../logger-context";
import { productUpdatedWebhook } from "./webhooks/product-updated";
import { productVariantCreatedWebhook } from "./webhooks/product-variant-created";
import { productVariantDeletedWebhook } from "./webhooks/product-variant-deleted";
import { productVariantUpdatedWebhook } from "./webhooks/product-variant-updated";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "CMS App is a multi-integration app that connects Saleor with popular Content Management Systems.",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
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
      id: "saleor.app.cms2",
      name: "CMS",
      permissions: ["MANAGE_PRODUCTS"],
      requiredSaleorVersion: ">=3.10 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      /*
       * TODO optimize - create webhooks dynamically, otherwise app will generate traffic not being configured first
       */
      webhooks: [
        /**
         * Create variant in CMS
         */
        productVariantCreatedWebhook.getWebhookManifest(apiBaseURL),
        /**
         * Update variant in CMS
         */
        productVariantUpdatedWebhook.getWebhookManifest(apiBaseURL),
        /**
         * Delete variant in CMS
         */
        productVariantDeletedWebhook.getWebhookManifest(apiBaseURL),
        /**
         * Detect changes in parent product (slug, name) and create/update all variants in CMS
         */
        productUpdatedWebhook.getWebhookManifest(apiBaseURL),
      ],
    };

    return manifest;
  },
});

export default wrapWithLoggerContext(withSpanAttributes(handler), loggerContext);
