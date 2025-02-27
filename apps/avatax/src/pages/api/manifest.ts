import { SpanKind } from "@opentelemetry/api";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";

import { env } from "@/env";
import { BaseError } from "@/error";
import { externalMeter } from "@/lib/otel-metrics";
import { externalTracer } from "@/lib/otel-tracers";
import { loggerContext } from "@/logger-context";
import { getMetricReader } from "@/otel-instrumentation.node";

import packageJson from "../../../package.json";
import { appWebhooks } from "../../../webhooks";

const requestCounter = externalMeter.createCounter("http.requests", {
  description: "Count of HTTP requests",
  unit: "{requests}",
});

export default wrapWithLoggerContext(
  wrapWithSpanAttributes(
    createManifestHandler({
      async manifestFactory({ appBaseUrl }) {
        const iframeBaseUrl = env.APP_IFRAME_BASE_URL ?? appBaseUrl;
        const apiBaseURL = env.APP_API_BASE_URL ?? appBaseUrl;

        return externalTracer.startActiveSpan(
          "createManifestHandler",
          {
            kind: SpanKind.CLIENT,
          },
          async (span) => {
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

            /*
             * span.setAttribute("http.method", "GET");
             * span.setAttribute("http.status_code", 200);
             */

            const error = new BaseError("Test error for span!");

            // console.log("SPAN", span);

            // serialize to avoid leaking stack trace
            span.recordException(BaseError.serialize(error));

            span.addEvent("Fetched manifest");

            // span.setStatus({ code: SpanStatusCode.ERROR });

            span.end();

            requestCounter.add(1);

            await getMetricReader()?.forceFlush();

            return manifest;
          },
        );
      },
    }),
  ),
  loggerContext,
);
