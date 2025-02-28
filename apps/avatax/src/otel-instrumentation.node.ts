import { metrics } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";

import { otelResource } from "./lib/otel/otel-resource";
import { meterProvider } from "./lib/otel/shared-metrics";
import { spanProcessor } from "./lib/otel/shared-span-processor";

const sdk = new NodeSDK({
  resource: otelResource,
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessor,
  instrumentations: [createHttpInstrumentation()],
});

sdk.start();

metrics.setGlobalMeterProvider(meterProvider);
