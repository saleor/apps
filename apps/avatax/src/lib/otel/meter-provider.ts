import { Resource } from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions/incubating";
import { createMetricsReader } from "@saleor/apps-otel/src/metrics-reader-factory";
import { race } from "@saleor/apps-shared";

import { env } from "@/env";
import { BaseError } from "@/error";

export const meterProvider = new MeterProvider({
  readers: [
    createMetricsReader({
      accessToken: env.OTEL_ACCESS_TOKEN,
    }),
  ],
  resource: new Resource({
    // be extra careful with adding attributes here - each one will add cardinality to the metrics
    [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
  }),
});

const MetricsTimeoutFlushError = BaseError.subclass("MetricsTimeoutFlushError");

export const flushOtelMetrics = async () => {
  await race({
    promise: meterProvider.forceFlush(),
    timeoutMilis: 1_000,
    error: new MetricsTimeoutFlushError("Metrics did not flush in (1s) time"),
  });
};
