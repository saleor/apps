import { metrics } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { createResource } from "@saleor/apps-otel/src/resource-factory";

import { env } from "@/env";

import pkg from "../package.json";
import { otelMeterProvider } from "./lib/otel-metrics-reader";

const sdk = new NodeSDK({
  resource: createResource({
    serviceName: env.OTEL_SERVICE_NAME,
    serviceVersion: pkg.version,
    serviceEnviroment: env.ENV,
    serviceCommitSha: env.VERCEL_GIT_COMMIT_SHA,
  }),
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessor: createBatchSpanProcessor({
    accessToken: env.OTEL_ACCESS_TOKEN,
  }),
  instrumentations: [createHttpInstrumentation()],
});

metrics.setGlobalMeterProvider(otelMeterProvider);

sdk.start();
