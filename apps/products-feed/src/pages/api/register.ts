import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "../../logger";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { saleorApp } from "../../saleor-app";
import { withOtel } from "@saleor/apps-otel";
import { loggerContext } from "../../logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default wrapWithLoggerContext(
  withOtel(
    createAppRegisterHandler({
      apl: saleorApp.apl,
      allowedSaleorUrls: [
        (url) => {
          if (allowedUrlsPattern) {
            const regex = new RegExp(allowedUrlsPattern);

            return regex.test(url);
          }

          return true;
        },
      ],
    }),
    "/api/register",
  ),
  loggerContext,
);
