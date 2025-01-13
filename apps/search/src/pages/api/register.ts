import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import escapeStringRegexp from "escape-string-regexp";

import { saleorApp } from "../../../saleor-app";
import { loggerContext } from "../../lib/logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

export default wrapWithLoggerContext(
  withOtel(
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
    "api/register",
  ),
  loggerContext,
);
