import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";

import { env } from "@/env";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";

import { saleorApp } from "../../../saleor-app";

const logger = createLogger("createAppRegisterHandler");

const allowedUrlsPattern = env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default wrapWithLoggerContext(
  wrapWithSpanAttributes(
    createAppRegisterHandler({
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

            return regex.test(url);
          }

          return true;
        },
      ],
      onAuthAplSaved: async (_req, context) => {
        logger.info("AvaTax app configuration set up successfully", {
          saleorApiUrl: context.authData.saleorApiUrl,
        });
      },
    }),
  ),
  loggerContext,
);
