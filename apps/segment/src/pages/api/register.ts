import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/src/logger-context";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { env } from "@/env";
import { loggerContext } from "@/logger-context";
import { saleorApp } from "@/saleor-app";

const allowedUrlsPattern = env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default wrapWithLoggerContext(
  withSpanAttributes(
    createAppRegisterHandler({
      apl: saleorApp.apl,
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
    }),
  ),
  loggerContext,
);
