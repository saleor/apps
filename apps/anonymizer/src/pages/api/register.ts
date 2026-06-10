import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { saleorApp } from "../../../saleor-app";
import { env } from "../../env";
import { createLogger } from "../../logger";
import { loggerContext } from "../../logger-context";

const allowedUrlsPattern = env.ALLOWED_DOMAIN_PATTERN;

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
        let checkResult: boolean;

        try {
          // we don't escape the pattern because it's not user input - it's an ENV variable controlled by us
          checkResult = new RegExp(allowedUrlsPattern).test(url);
        } catch (error) {
          /*
           * An invalid ALLOWED_DOMAIN_PATTERN would make `new RegExp` throw and
           * turn the register endpoint into a 500, silently blocking every
           * install. Fail closed with a clear log instead of crashing.
           */
          logger.error("ALLOWED_DOMAIN_PATTERN is not a valid regular expression", {
            reason: error instanceof Error ? error.message : "Unknown error",
          });

          return false;
        }

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
});

export default wrapWithLoggerContext(withSpanAttributes(handler), loggerContext);
