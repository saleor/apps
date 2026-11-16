import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { type AppManifest } from "@saleor/app-sdk/types";

import { env } from "@/lib/env";
import packageJson from "@/package.json";

/**
 * App SDK helps with the valid Saleor App Manifest creation. Read more:
 * https://github.com/saleor/saleor-app-sdk/blob/main/docs/api-handlers.md#manifest-handler-factory
 */
export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    /**
     * Allow to overwrite default app base url, to enable Docker support.
     *
     * See docs: https://docs.saleor.io/docs/3.x/developer/extending/apps/local-app-development
     */
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      name: "Saleor Aboard",
      about: "Import an existing product catalog into Saleor.",
      appUrl: iframeBaseUrl,
      /**
       * Set permissions for app if needed
       * https://docs.saleor.io/docs/3.x/developer/permissions
       */
      permissions: ["MANAGE_PRODUCTS", "MANAGE_CHANNELS", "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES"],
      id: "saleor.aboard",
      version: packageJson.version,
      requiredSaleorVersion: ">=3.23 <4",
      homepageUrl: "https://github.com/saleor/apps",
      supportUrl: "https://github.com/saleor/apps/discussions",
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      webhooks: [],
      extensions: [
        {
          label: "Import catalog",
          mount: "NAVIGATION_CATALOG",
          target: "APP_PAGE",
          permissions: [
            "MANAGE_PRODUCTS",
            "MANAGE_CHANNELS",
            "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
          ],
          url: "/",
        },
        {
          label: "Import products",
          mount: "PRODUCT_OVERVIEW_CREATE",
          target: "APP_PAGE",
          permissions: [
            "MANAGE_PRODUCTS",
            "MANAGE_CHANNELS",
            "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
          ],
          url: "/",
        },
        {
          label: "Import your catalog",
          mount: "HOMEPAGE_WIDGETS",
          target: "WIDGET",
          permissions: [
            "MANAGE_PRODUCTS",
            "MANAGE_CHANNELS",
            "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
          ],
          url: "/extensions/homepage",
          options: {
            homeWidgetTarget: {
              method: "GET",
              fullscreen: false,
            },
          },
        },
      ],
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/app-icon.png`,
        },
      },
    };

    return manifest;
  },
});
