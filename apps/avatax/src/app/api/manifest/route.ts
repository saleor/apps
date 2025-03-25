import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { AppManifest } from "@saleor/app-sdk/types";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import { captureException } from "@sentry/nextjs";

import { env } from "@/env";
import { BaseError } from "@/error";
import { withLoggerContext } from "@/logger-context";

import packageJson from "../../../../package.json";
import { appWebhooks } from "../../../../webhooks";

const handler = createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      about: "App connects with AvaTax to dynamically calculate taxes",
      appUrl: iframeBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [],
      homepageUrl: "https://github.com/saleor/apps",
      id: env.MANIFEST_APP_ID,
      name: "AvaTax",
      permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
      requiredSaleorVersion: ">=3.19 <4",
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      version: packageJson.version,
      webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
    };

    captureException(new BaseError("Test error from Next.js 15"));

    return manifest;
  },
});

export const GET = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
