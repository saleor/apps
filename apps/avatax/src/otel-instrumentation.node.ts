import { metrics } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";

import { env } from "@/env";

import { otelResource } from "./lib/otel-resource";
import { meterProvider } from "./lib/shared-metrics";

/*
 * const metricReader = createMetricReader({
 *   accessToken: env.OTEL_ACCESS_TOKEN!,
 *   exportIntervalMillis: 60_000,
 * });
 */

const sdk = new NodeSDK({
  resource: otelResource,
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessor: createBatchSpanProcessor({
    accessToken: env.OTEL_ACCESS_TOKEN!,
  }),
  instrumentations: [createHttpInstrumentation()],
});

sdk.start();

/*
 * hack to make the metric reader available globally
 * global.currentMetricReader = metricReader;
 */
metrics.setGlobalMeterProvider(meterProvider);
