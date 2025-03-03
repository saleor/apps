import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

import { env } from "@/env";

import pkg from "../../../package.json";

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({}),
});

export const meterProvider = new MeterProvider({
  readers: [metricReader],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: pkg.version,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.ENV,
  }),
});
