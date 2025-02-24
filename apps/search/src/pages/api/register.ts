import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";

import { saleorApp } from "../../../saleor-app";
import { loggerContext } from "../../lib/logger-context";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

export default wrapWithLoggerContext(
  wrapWithSpanAttributes(
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
