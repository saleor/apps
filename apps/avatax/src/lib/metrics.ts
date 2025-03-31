import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions/incubating";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

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
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
    [ObservabilityAttributes.COMMIT_SHA]: env.VERCEL_GIT_COMMIT_SHA,
    [ObservabilityAttributes.REPOSITORY_URL]: env.REPOSITORY_URL,
  }),
});

export const internalMeter = meterProvider.getMeter("saleor.app.avatax.core", pkg.version);
