import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";

import { saleorApp } from "@/saleor-app";

import { loggerContext } from "../../logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
const handler = createAppRegisterHandler({
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
});

export default wrapWithLoggerContext(wrapWithSpanAttributes(handler), loggerContext);
