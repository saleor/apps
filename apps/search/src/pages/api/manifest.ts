import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { appWebhooks } from "../../../webhooks";
import { withOtel } from "@saleor/apps-otel";

export default withOtel(
  createManifestHandler({
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
        webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
        author: "Saleor Commerce",
      };

      return manifest;
    },
  }),
  "api/manifest",
);
