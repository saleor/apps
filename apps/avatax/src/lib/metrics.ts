import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions/incubating";

import { env } from "@/env";

import pkg from "../../package.json";

export const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    headers: {
      "x-alb-access-token": env.OTEL_ACCESS_TOKEN!,
    },
  }),
});

export const meterProvider = new MeterProvider({
  readers: [metricReader],
  resource: new Resource({
    [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: pkg.version, // TODO: do we want to have more cardinality here?
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
  }),
});

export const internalMeter = meterProvider.getMeter("saleor.app.avatax.core", pkg.version);
