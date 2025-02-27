import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { createMetricReader } from "@saleor/apps-otel/src/metric-reader-factory";
import { createResource } from "@saleor/apps-otel/src/resource-factory";

import { env } from "@/env";

import pkg from "../package.json";

let metricReader: PeriodicExportingMetricReader | null = null;

export const initOTEL = () => {
  if (!metricReader) {
    metricReader = createMetricReader({
      accessToken: env.OTEL_ACCESS_TOKEN,
      exportIntervalMillis: 18_000,
    });

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
      metricReader,
      instrumentations: [createHttpInstrumentation()],
    });

    sdk.start();
  }
};

export function getMetricReader() {
  return metricReader;
}
