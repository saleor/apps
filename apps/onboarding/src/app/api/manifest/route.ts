import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { type AppManifest } from "@saleor/app-sdk/types";

import { env } from "@/lib/env";
import packageJson from "@/package.json";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseUrl = env.APP_API_BASE_URL ?? appBaseUrl;

    // todo update manifest we dont need tokenTargetUrl and appUrl
    const manifest: AppManifest = {
      about:
        "Saleor Onboarding App — guides new users through the first steps of using Saleor Dashboard.",
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [
        {
          label: "Welcome to Saleor Dashboard",
          mount: "HOMEPAGE_WIDGETS",
          target: "WIDGET",
          url: new URL("/", iframeBaseUrl).toString(),
          permissions: [],
          options: {
            homeWidgetTarget: { method: "GET", fullscreen: true },
          },
        },
      ],
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      name: env.APP_NAME,
      permissions: [],
      requiredSaleorVersion: ">=3.23 <4",
      supportUrl: "https://saleor.io/discord",
      version: packageJson.version,
      webhooks: [],
    };

    return manifest;
  },
});

export const GET = handler;
