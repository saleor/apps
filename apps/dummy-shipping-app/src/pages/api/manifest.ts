import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { type AppManifest } from "@saleor/app-sdk/types";

import { env } from "@/env";
import packageJson from "@/package.json";

import { orderFilterShippingMethodsWebhook } from "./webhooks/order-filter-shipping-methods";
import { shippingListMethodsForCheckoutWebhook } from "./webhooks/shipping-list-methods-for-checkout";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    /**
     * Allow to overwrite default app base url, to enable Docker support.
     *
     * https://docs.saleor.io/developer/extending/apps/local-app-development
     */
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      id: "saleor.app.dummy-shipping",
      name: "Dummy Shipping App",
      about:
        "Example app serving shipping methods from a dummy third-party shipping API, over Saleor sync webhooks.",
      version: packageJson.version,
      appUrl: iframeBaseUrl,
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      /**
       * MANAGE_SHIPPING and MANAGE_ORDERS are what Saleor requires to deliver the two sync
       * webhooks below - see WebhookEventSyncType.PERMISSIONS in Saleor Core. MANAGE_ORDERS
       * also covers the orders query the /actions page runs.
       */
      permissions: ["MANAGE_SHIPPING", "MANAGE_ORDERS"],
      webhooks: [
        shippingListMethodsForCheckoutWebhook.getWebhookManifest(apiBaseURL),
        orderFilterShippingMethodsWebhook.getWebhookManifest(apiBaseURL),
      ],
      extensions: [],
      author: "Saleor Commerce",
      homepageUrl: "https://github.com/saleor/apps",
      supportUrl: "https://github.com/saleor/apps/discussions",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
