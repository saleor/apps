import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { REQUIRED_SALEOR_VERSION, saleorApp } from "../../../saleor-app";
import {
  createGraphQLClient,
  createLogger,
  SaleorVersionCompatibilityValidator,
} from "@saleor/apps-shared";
import { gql } from "urql";
import { SaleorVersionQuery } from "../../../generated/graphql";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

const SaleorVersion = gql`
  query SaleorVersion {
    shop {
      version
    }
  }
`;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default createAppRegisterHandler({
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
  /**
   * TODO Unify with all apps - shared code. Consider moving to app-sdk
   */
  async onRequestVerified(req, { authData: { token, saleorApiUrl }, respondWithError }) {
    const logger = createLogger({
      context: "onRequestVerified",
    });

    try {
      const client = createGraphQLClient({
        saleorApiUrl,
        token,
      });

      const saleorVersion = await client
        .query<SaleorVersionQuery>(SaleorVersion, {})
        .toPromise()
        .then((res) => {
          return res.data?.shop.version;
        });

      logger.debug({ saleorVersion }, "Received saleor version from Shop query");

      if (!saleorVersion) {
        throw new Error("Saleor Version couldnt be fetched from the API");
      }

      new SaleorVersionCompatibilityValidator(REQUIRED_SALEOR_VERSION).validateOrThrow(
        saleorVersion
      );
    } catch (e: unknown) {
      const message = (e as Error)?.message ?? "Unknown error";

      logger.debug({ message }, "Failed validating semver, will respond with error and status 400");

      throw respondWithError({
        message: message,
        status: 400,
      });
    }
  },
});
