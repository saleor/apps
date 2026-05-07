import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { type AppExtension, type AppManifest } from "@saleor/app-sdk/types";

import { env } from "@/lib/env";
import packageJson from "@/package.json";

/**
 * HOME_WIDGETS is not yet declared in the SDK's AppExtensionMount union, so we cast.
 * The mount lands in dashboards that recognize it; older dashboards silently ignore it.
 */
const homeWidgetExtension = {
  label: "Onboarding",
  mount: "HOME_WIDGETS",
  target: "WIDGET",
  url: "/",
  permissions: [],
  options: {
    widgetTarget: { method: "GET" },
  },
} as unknown as AppExtension;

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseUrl = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about:
        "Saleor Onboarding widget — guides new users through the first steps of using Saleor Dashboard.",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [homeWidgetExtension],
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      name: env.APP_NAME,
      permissions: [],
      requiredSaleorVersion: ">=3.23 <4",
      supportUrl: "https://saleor.io/discord",
      tokenTargetUrl: `${apiBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [],
    };

    return manifest;
  },
});

export const GET = handler;
