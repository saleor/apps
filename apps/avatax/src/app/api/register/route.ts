import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { env } from "@/env";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { createLogger } from "@/logger";
import { withLoggerContext } from "@/logger-context";

import { saleorApp } from "../../../../saleor-app";

const logger = createLogger("createAppRegisterHandler");

const allowedUrlsPattern = env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
const handler = createAppRegisterHandler({
  apl: saleorApp.apl,
  /**
   * Prohibit installation from Saleor other than specified by the regex.
   * Regex source is ENV so if ENV is not set, all installations will be allowed.
   */
  allowedSaleorUrls: [
    (url) => {
      if (allowedUrlsPattern) {
        // we don't escape the pattern because it's not user input - it's an ENV variable controlled by us
        const regex = new RegExp(allowedUrlsPattern);

        const checkResult = regex.test(url);

        if (!checkResult) {
          logger.warn("Blocked installation attempt from disallowed Saleor instance", {
            saleorApiUrl: url,
          });
        }

        return checkResult;
      }

      return true;
    },
  ],
  onAplSetFailed: async (_req, context) => {
    logger.error("Failed to set APL", {
      saleorApiUrl: context.authData.saleorApiUrl,
      error: context.error,
    });
  },
  onAuthAplSaved: async (_req, context) => {
    logger.info("App configuration set up successfully", {
      saleorApiUrl: context.authData.saleorApiUrl,
    });
  },
});

export const POST = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withSpanAttributesAppRouter,
)(handler);
