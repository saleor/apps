import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { REQUIRED_SALEOR_VERSION, saleorApp } from "../../saleor-app";
import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared";
import { fetchSaleorVersion } from "../../modules/feature-flag-service/fetch-saleor-version";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "@saleor/apps-logger";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default withOtel(
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
        logger.info({ saleorApiUrl }, "Rejecting installation due to incompatible Saleor version");
        throw respondWithError({
          message: `Saleor version (${saleorVersion}) is not compatible with this app version (${REQUIRED_SALEOR_VERSION})`,
          status: 400,
        });
      }

      logger.info("Saleor version validated successfully");
    },
  }),
  "api/register",
);
