import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";

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
        // we don't escape the pattern because it's not user input - it's an ENV variable controlled by us
        const regex = new RegExp(allowedUrlsPattern);

        return regex.test(url);
      }

      return true;
    },
  ],
});

export default wrapWithLoggerContext(wrapWithSpanAttributes(handler), loggerContext);
