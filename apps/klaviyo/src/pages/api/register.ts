import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import escapeStringRegexp from "escape-string-regexp";

import { saleorApp } from "../../../saleor-app";
import { loggerContext } from "../../logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

const handler = createAppRegisterHandler({
  apl: saleorApp.apl,
  /**
   * Prohibit installation from Saleor other than specified by the regex.
   * Regex source is ENV so if ENV is not set, all installations will be allowed.
   */
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
