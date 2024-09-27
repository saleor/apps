import { type ClientRequest } from "node:http";

import { diag, DiagConsoleLogger, DiagLogLevel, SpanStatusCode } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  SemanticAttributes,
  SemanticResourceAttributes,
} from "@opentelemetry/semantic-conventions";

import { otelLogsProcessor } from "./otel-logs-setup";
import { batchSpanProcessor } from "./otel-traces-setup";

if (process.env.ENABLE_OTEL_RUNTIME_LOGS === "true") {
  const getLogLevel = () => {
    switch (process.env.OTEL_LOG_LEVEL) {
      case "debug":
        return DiagLogLevel.DEBUG;
      case "error":
        return DiagLogLevel.ERROR;
      case "warn":
        return DiagLogLevel.WARN;
      case "verbose":
        return DiagLogLevel.VERBOSE;
      case "all":
        return DiagLogLevel.ALL;
      case "none":
        return DiagLogLevel.NONE;
      case "info":
      default:
        return DiagLogLevel.INFO;
    }
  };

  diag.setLogger(new DiagConsoleLogger(), getLogLevel());
}

export const otelSdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERCEL_GIT_COMMIT_SHA,
    "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
  }),
  spanProcessor: batchSpanProcessor,
  // @ts-expect-error - TODO: there are problems with the OTEL types - update OTEL package and fix it
  logRecordProcessor: otelLogsProcessor,
  textMapPropagator: new W3CTraceContextPropagator(),
  instrumentations: [
    new HttpInstrumentation({
      requireParentforIncomingSpans: true,
      requireParentforOutgoingSpans: true,
      /**
       * HTTP spans are creates as entry spans/siblings, instead of children.
       * TODO Fix this.
       */
      applyCustomAttributesOnSpan: (span, req, response) => {
        span.setAttribute(SemanticAttributes.HTTP_ROUTE, (req as ClientRequest)?.path);
        span.setAttribute(SemanticAttributes.HTTP_HOST, (req as ClientRequest)?.host);

        if (response.statusCode) {
          span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, response.statusCode);
        }

        if (response.statusCode && response.statusCode >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
        }

        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
          span.setStatus({
            code: SpanStatusCode.OK,
          });
        }
      },

      ignoreOutgoingUrls: [
        (url) => url.includes("ingest.sentry.io"),
        (url) => url.includes("/v1/logs"),
      ],
    }),
  ],
});
