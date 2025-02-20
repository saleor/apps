import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";

import { env } from "@/env";

import pkg from "../package.json";
import { OTELSampler } from "./lib/otel-sampler";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.ENV,
    "commit-sha": env.VERCEL_GIT_COMMIT_SHA,
  }),
  textMapPropagator: new W3CTraceContextPropagator(),
  sampler: new OTELSampler(), // custom sampler to test allow all spans
  spanProcessor: createBatchSpanProcessor({
    accessToken: env.OTEL_ACCESS_TOKEN,
  }),
  instrumentations: [
    new HttpInstrumentation({
      requireParentforIncomingSpans: true,
      requireParentforOutgoingSpans: true,
      ignoreOutgoingUrls: [
        (url) => url.includes("ingest.sentry.io"),
        (url) => url.includes("/v1/logs"),
      ],
    }),
  ],
});

sdk.start();

console.log("OTEL enabled, starting SDK");
