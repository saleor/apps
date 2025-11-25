import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import { env } from "@/lib/env";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    return {
      id: env.MANIFEST_APP_ID,
      name: env.APP_NAME,
      version: "0.1.0",
      about: "Bi-directional product sync between Shopify and Saleor",
      permissions: ["MANAGE_PRODUCTS", "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES"],
      appUrl: appBaseUrl,
      tokenTargetUrl: `${appBaseUrl}/api/register`,
      extensions: [],
      supportUrl: "https://github.com/saleor/apps",
      homepageUrl: "https://github.com/saleor/apps",
      dataPrivacyUrl: "https://saleor.io/legal/privacy",
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${appBaseUrl}/logo.png`,
        },
      },
    };
  },
});
