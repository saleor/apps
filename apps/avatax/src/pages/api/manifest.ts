import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";

import packageJson from "../../../package.json";
import { appWebhooks } from "../../../webhooks";
import { loggerContext } from "../../logger-context";

export default wrapWithLoggerContext(
  withOtel(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

        const manifest: AppManifest = {
          about: "App connects with AvaTax to dynamically calculate taxes",
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
          name: "AvaTax",
          permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
          requiredSaleorVersion: ">=3.19 <4",
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
