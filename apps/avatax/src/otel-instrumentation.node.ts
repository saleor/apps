import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { createResource } from "@saleor/apps-otel/src/resource-factory";

import { env } from "@/env";

import pkg from "../package.json";
import { metricReader } from "./lib/otel-metric-reader";

export function initSDK() {
  const sdk = new NodeSDK({
    resource: createResource({
      serviceName: env.OTEL_SERVICE_NAME,
      serviceVersion: pkg.version,
      serviceEnviroment: env.ENV,
      serviceCommitSha: env.VERCEL_GIT_COMMIT_SHA,
    }),
    textMapPropagator: new W3CTraceContextPropagator(),
    spanProcessors: [
      createBatchSpanProcessor({
        accessToken: env.OTEL_ACCESS_TOKEN!,
      }),
    ],
    metricReader: metricReader,
    instrumentations: [createHttpInstrumentation()],
  });

  sdk.start();

  // @ts-expect-error
  global.currentMetricReader = metricReader;
}
