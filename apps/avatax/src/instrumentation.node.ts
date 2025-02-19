import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

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
  sampler: new OTELSampler(), // custom sampler to test allow all spans
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      headers: {
        "x-alb-access-token": env.OTEL_ACCESS_TOKEN,
      },
    }),
  ),
});

sdk.start();

console.log("OTEL enabled, starting SDK");
