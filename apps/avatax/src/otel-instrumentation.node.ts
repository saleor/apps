import { metrics } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerOTel } from "@vercel/otel";

import pkg from "../package.json";
import { env } from "./env";
import { meterProvider } from "./lib/otel/shared-metrics";

export function register() {
  registerOTel({
    serviceName: env.OTEL_SERVICE_NAME,
    attributes: {
      [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.ENV,
      "commit-sha": env.VERCEL_GIT_COMMIT_SHA,
    },
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({}))],
  });
  metrics.setGlobalMeterProvider(meterProvider);
}
