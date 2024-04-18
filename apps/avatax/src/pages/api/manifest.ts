import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import packageJson from "../../../package.json";
import { REQUIRED_SALEOR_VERSION } from "../../../saleor-app";
import { appWebhooks } from "../../../webhooks";
import { loggerContext } from "../../logger-context";
import { BaseError } from "../../error";
import { createLogger } from "../../logger";

export default wrapWithLoggerContext(
  withOtel(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

        const Err = BaseError.subclass("TestError", {
          props: {
            prop1: "prop1",
            subError: new Error("sub error"),
          },
        });

        const logger = createLogger("manifest");

        logger.error("test error log with error field", {
          error: new Err("test manifest err", {
            props: {
              inlineProp: 1,
            },
          }),
        });
        logger.error("test error log with exception field", {
          exception: new Err("test manifest err"),
        });
        logger.warn("test warn log with error field", { error: new Err("test manifest err") });
        logger.warn("test warn log with exception field", {
          exception: new Err("test manifest err"),
        });

        const manifest: AppManifest = {
          about: "App connects with Avatax to dynamically calculate taxes",
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
          id: "saleor.app.avatax",
          name: "Avatax",
          permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
          requiredSaleorVersion: REQUIRED_SALEOR_VERSION,
          supportUrl: "https://github.com/saleor/apps/discussions",
          tokenTargetUrl: `${apiBaseURL}/api/register`,
          version: packageJson.version,
          webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
        };

        return manifest;
      },
    }),
    "/api/manifest",
  ),
  loggerContext,
);
