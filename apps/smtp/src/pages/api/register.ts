import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared/saleor-version-compatibility-validator";

import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../logger";
import { loggerContext } from "../../logger-context";
import { fetchSaleorVersion } from "../../modules/feature-flag-service/fetch-saleor-version";
import { REQUIRED_SALEOR_VERSION, saleorApp } from "../../saleor-app";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

const logger = createLogger("createAppRegisterHandler");

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

            const checkResult = regex.test(url);

            if (!checkResult) {
              logger.warn("Blocked installation attempt from disallowed Saleor instance", {
                saleorApiUrl: url,
                allowedUrlsPattern,
              });
            }

            return checkResult;
          }

          return true;
        },
      ],
      async onRequestVerified(req, { authData: { token, saleorApiUrl }, respondWithError }) {
        const logger = createLogger("onRequestVerified");

        let saleorVersion: string;

        try {
          const client = createInstrumentedGraphqlClient({
            saleorApiUrl: saleorApiUrl,
            token: token,
          });

          saleorVersion = await fetchSaleorVersion(client);
        } catch (e: unknown) {
          const message = (e as Error)?.message ?? "Unknown error";

          logger.debug(
            { message, saleorApiUrl },
            "Error during fetching saleor version in onRequestVerified handler",
          );

          throw respondWithError({
            message: "Couldn't communicate with Saleor API",
            status: 400,
          });
        }

        if (!saleorVersion) {
          logger.warn({ saleorApiUrl }, "No version returned from Saleor API");
          throw respondWithError({
            message: "Saleor version couldn't be fetched from the API",
            status: 400,
          });
        }

        const isVersionValid = new SaleorVersionCompatibilityValidator(
          REQUIRED_SALEOR_VERSION,
        ).isValid(saleorVersion);

        if (!isVersionValid) {
          logger.info(
            { saleorApiUrl },
            "Rejecting installation due to incompatible Saleor version",
          );
          throw respondWithError({
            message: `Saleor version (${saleorVersion}) is not compatible with this app version (${REQUIRED_SALEOR_VERSION})`,
            status: 400,
          });
        }

        logger.info("Saleor version validated successfully");
      },
    }),
  ),
  loggerContext,
);
