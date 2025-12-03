import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { createLogger } from "src/logger";

import { saleorApp } from "../../../saleor-app";
import { loggerContext } from "../../logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

const logger = createLogger("createAppRegisterHandler");

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

export default wrapWithLoggerContext(withSpanAttributes(handler), loggerContext);
