import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";
import { BaseError } from "@/errors";
import { loggerContext } from "@/logger-context";
import { appWebhooks } from "@/modules/webhooks/webhooks";

import packageJson from "../../../package.json";

export default wrapWithLoggerContext(
  createManifestHandler({
    async manifestFactory({ appBaseUrl }) {
      const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
      const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

      Sentry.captureException(new BaseError("Test segment Sentry integration", { cause: "test" }));

      const manifest: AppManifest = {
        about: "Seamlessly feed Twillo Segment with Saleor events",
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
        name: "Twilio Segment",
        permissions: ["MANAGE_ORDERS"],
        requiredSaleorVersion: ">=3.20 <4",
        supportUrl: "https://github.com/saleor/apps/discussions",
        tokenTargetUrl: `${apiBaseURL}/api/register`,
        version: packageJson.version,
        webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
      };

      return manifest;
    },
  }),
  loggerContext,
);
