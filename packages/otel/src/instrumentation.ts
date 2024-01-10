import { type ClientRequest } from "node:http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  SemanticAttributes,
  SemanticResourceAttributes,
} from "@opentelemetry/semantic-conventions";
// import { diag, DiagConsoleLogger, DiagLogLevel, trace } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { SpanStatusCode } from "@opentelemetry/api";
import { batchSpanProcessor } from "./otel-traces-setup";
import { otelLogsProcessor } from "./otel-logs-setup";

/*
 * For troubleshooting, set the log level to DiagLogLevel.DEBUG
 * diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
 */

export const otelSdk = new NodeSDK({
  resource: new Resource({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    // [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version, TODO
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
  }),
  spanProcessor: batchSpanProcessor,
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
