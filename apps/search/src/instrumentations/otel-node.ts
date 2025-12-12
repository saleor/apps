import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_INSTANCE_ID,
} from "@opentelemetry/semantic-conventions/incubating";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { DeferredSampler } from "@saleor/apps-otel/src/deferred-sampler";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { createServiceInstanceId } from "@saleor/apps-otel/src/service-instance-id-factory";
import { TraceBufferingTailSamplingProcessor } from "@saleor/apps-otel/src/trace-buffering-tail-sampling-processor";
import { registerOTel } from "@vercel/otel";

import pkg from "../../package.json";

const batchProcessor = createBatchSpanProcessor({
  accessToken: process.env.OTEL_ACCESS_TOKEN,
});

const tailSamplingProcessor = new TraceBufferingTailSamplingProcessor({
  processor: batchProcessor,
  slowThresholdMs: 5000,
  bufferTimeoutMs: 55000, // Under Vercel's 60s timeout
  exportErrors: true,
  exportSlowSpans: true,
});

registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME,
  // Note: DeferredSampler + TraceBufferingTailSamplingProcessor must be used together
  traceSampler: new DeferredSampler(),
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.ENV,
    [ATTR_SERVICE_INSTANCE_ID]: createServiceInstanceId(),
    [ObservabilityAttributes.COMMIT_SHA]: process.env.VERCEL_GIT_COMMIT_SHA,
    [ObservabilityAttributes.REPOSITORY_URL]: process.env.REPOSITORY_URL,
    // override attribute set by `@vercel/otel` - if you are using OSS version you can remove it
    env: undefined,
    [ObservabilityAttributes.VERCEL_ENV]: process.env.VERCEL_ENV,
  },
  spanProcessors: [tailSamplingProcessor],
  instrumentations: [createHttpInstrumentation({ usingDeferredSpanProcessor: true })],
});
