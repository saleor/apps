import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { type AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { env } from "@/env";

import packageJson from "../../../package.json";
import { appDeletedWebhook } from "../../app/api/webhooks/app-deleted/webhook-definition";
import { createLogger } from "../../logger";
import { loggerContext } from "../../logger-context";
import { DEPRECATION_REASON } from "../../modules/deprecation/deprecation-reason";

export default wrapWithLoggerContext(
  withSpanAttributes(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

        const logger = createLogger("manifestFactory");

        logger.info("Generating manifest");

        const manifest: AppManifest = {
          about:
            "[Deprecated] Replaced by the Google Merchant Center app, installable from Extensions \u2192 Explore. Still functional, but no longer developed.",
          appUrl: iframeBaseUrl,
          author: "Saleor Commerce",
          brand: {
            logo: {
              default: `${apiBaseURL}/logo.png`,
            },
          },
          /*
           * Saleor below 3.23 ignores this field; the daily cron picks such an installation up
           * once its core is upgraded.
           */
          deprecationReason: DEPRECATION_REASON,
          dataPrivacyUrl: "https://saleor.io/legal/privacy/",
          extensions: [],
          homepageUrl: "https://github.com/saleor/apps",
          id: "saleor.app.product-feed",
          name: "Product Feed (deprecated)",
          permissions: ["MANAGE_PRODUCTS"],
          supportUrl: "https://github.com/saleor/apps/discussions",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          version: packageJson.version,
          requiredSaleorVersion: ">=3.22 <3.24",
          webhooks: [appDeletedWebhook.getWebhookManifest(apiBaseURL)],
        };

        return manifest;
      },
    }),
  ),
  loggerContext,
);
