import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../saleor-app";
import { wrapWithLoggerContext } from "@/lib/logger/logger-context";
import { withOtel } from "@/lib/otel/otel-wrapper";
import { loggerContext } from "@/logger-context";
import { createLogger } from "@/lib/logger/create-logger";

const logger = createLogger("createAppRegisterHandler");

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default wrapWithLoggerContext(
  withOtel(
    createAppRegisterHandler({
      apl: saleorApp.apl,
      /**
       * Prohibit installation from Saleors other than specified by the regex.
       * Regex source is ENV so if ENV is not set, all installations will be allowed.
       */
      allowedSaleorUrls: [
        (url) => {
          if (allowedUrlsPattern) {
            const regex = new RegExp(allowedUrlsPattern);

            return regex.test(url);
          }

          return true;
        },
      ],
      onAuthAplSaved: async (_req, context) => {
        logger.info("Dummy payment app configuration set up successfully", {
          saleorApiUrl: context.authData.saleorApiUrl,
        });
      },
    }),
    "/api/register"
  ),

  loggerContext
);
