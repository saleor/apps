import { DiagConsoleLogger, DiagLogLevel, SpanStatusCode, diag } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMATTRS_HTTP_ROUTE,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_HOST,
} from "@opentelemetry/semantic-conventions";
import { type ClientRequest } from "node:http";
import { otelLogsProcessor } from "./otel-logs-setup";
import { batchSpanProcessor } from "./otel-traces-setup";

if (process.env.ENABLE_DEBUG_OTEL_DIAG === "true") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

export const otelSdk = new NodeSDK({
  resource: new Resource({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    // [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version, TODO
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
  }),
  spanProcessors: [batchSpanProcessor],
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
        span.setAttribute(SEMATTRS_HTTP_ROUTE, (req as ClientRequest)?.path);
        span.setAttribute(SEMATTRS_HTTP_HOST, (req as ClientRequest)?.host);

        if (response.statusCode) {
          span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, response.statusCode);
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
