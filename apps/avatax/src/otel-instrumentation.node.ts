import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { createBatchSpanProcessor } from "@saleor/apps-otel/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/http-instrumentation-factory";
import { createResource } from "@saleor/apps-otel/resource-factory";

import { env } from "@/env";

import pkg from "../package.json";
import { OTELSampler } from "./lib/otel-sampler";

const sdk = new NodeSDK({
  resource: createResource({
    serviceName: env.OTEL_SERVICE_NAME,
    serviceVersion: pkg.version,
    serviceEnviroment: env.ENV,
    serviceCommitSha: env.VERCEL_GIT_COMMIT_SHA,
  }),
  textMapPropagator: new W3CTraceContextPropagator(),
  sampler: new OTELSampler(), // custom sampler to test allow all spans
  spanProcessor: createBatchSpanProcessor({
    accessToken: env.OTEL_ACCESS_TOKEN,
  }),
  instrumentations: [createHttpInstrumentation()],
});

sdk.start();

console.log("OTEL enabled, starting SDK");
