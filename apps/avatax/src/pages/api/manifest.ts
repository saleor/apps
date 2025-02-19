import { trace } from "@opentelemetry/api";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import { env } from "@/env";
import { wrapWithSpanAttrs } from "@/lib/wrap-with-span-attrs";
import { loggerContext } from "@/logger-context";

import packageJson from "../../../package.json";
import { appWebhooks } from "../../../webhooks";

export default wrapWithLoggerContext(
  wrapWithSpanAttrs(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

        return trace
          .getTracer("saleor-app-avatax")
          .startActiveSpan("createManifestHandler", (span) => {
            span.setAttribute("appBaseUrl", appBaseUrl);
            span.setAttribute("iframeBaseUrl", iframeBaseUrl);
            span.setAttribute("apiBaseURL", apiBaseURL);

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
              id: env.MANIFEST_APP_ID,
              name: "AvaTax",
              permissions: ["HANDLE_TAXES", "MANAGE_ORDERS"],
              requiredSaleorVersion: ">=3.19 <4",
              supportUrl: "https://github.com/saleor/apps/discussions",
              tokenTargetUrl: `${apiBaseURL}/api/register`,
              version: packageJson.version,
              webhooks: appWebhooks.map((w) => w.getWebhookManifest(apiBaseURL)),
            };

            console.log("MANIFEST SPAN", span);
            span.end();

            return manifest;
          });
      },
    }),
  ),
  loggerContext,
);
