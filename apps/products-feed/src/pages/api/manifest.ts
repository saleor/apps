import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import { createLogger } from "../../logger";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import packageJson from "../../../package.json";
import { withOtel } from "@saleor/apps-otel";
import { loggerContext } from "../../logger-context";

export default wrapWithLoggerContext(
  withOtel(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

        const logger = createLogger("manifestFactory");

        logger.info("Generating manifest");

        const manifest: AppManifest = {
          about: "Generate feeds consumed by Merchant Platforms",
          appUrl: iframeBaseUrl,
          author: "Saleor Commerce",
          brand: {
            logo: {
              default: `${apiBaseURL}/logo.png`,
            },
          },
          dataPrivacyUrl: "https://saleor.io/legal/privacy/",
          extensions: [],
          homepageUrl: "https://github.com/saleor/apps",
          id: "saleor.app.product-feed",
          name: "Product Feed",
          permissions: ["MANAGE_PRODUCTS"],
          supportUrl: "https://github.com/saleor/apps/discussions",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          version: packageJson.version,
          webhooks: [],
        };

        return manifest;
      },
    }),
    "/api/manifest",
  ),
  loggerContext,
);
