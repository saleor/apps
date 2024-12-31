import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import escapeStringRegexp from "escape-string-regexp";

import { env } from "@/env";
import { loggerContext, wrapWithLoggerContext } from "@/logger-context";
import { saleorApp } from "@/saleor-app";

const allowedUrlsPattern = env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default wrapWithLoggerContext(
  createAppRegisterHandler({
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
  }),
  loggerContext,
);
