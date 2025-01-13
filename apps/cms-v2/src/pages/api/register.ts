import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import escapeStringRegexp from "escape-string-regexp";

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
        const regex = new RegExp(escapeStringRegexp(allowedUrlsPattern));

        return regex.test(url);
      }

      return true;
    },
  ],
});

export default wrapWithLoggerContext(withOtel(handler, "/api/register"), loggerContext);
