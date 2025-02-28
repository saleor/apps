import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { createMetricReader } from "@saleor/apps-otel/src/metric-reader-factory";

import { env } from "@/env";

import { otelResource } from "./otel-resource";

export const meterProvider = new MeterProvider({
  resource: otelResource,
});

const metricReader = createMetricReader({
  accessToken: env.OTEL_ACCESS_TOKEN!,
  exportIntervalMillis: 60_000,
});

meterProvider.addMetricReader(metricReader);
