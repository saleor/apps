import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { createResource } from "@saleor/apps-otel/src/resource-factory";

import pkg from "../package.json";

const sdk = new NodeSDK({
  resource: createResource({
    serviceName: process.env.OTEL_SERVICE_NAME,
    serviceVersion: pkg.version,
    serviceEnviroment: process.env.ENV,
    serviceCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  }),
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessor: createBatchSpanProcessor({
    accessToken: process.env.OTEL_ACCESS_TOKEN,
  }),
  instrumentations: [createHttpInstrumentation()],
});

sdk.start();
