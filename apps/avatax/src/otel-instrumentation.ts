/* eslint-disable node/no-process-env */
// Use `process.env` here to avoid broken Next.js build
import { Context, Sampler, SamplingResult, SpanKind } from "@opentelemetry/api";
import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { registerOTel } from "@vercel/otel";

import pkg from "../package.json";

class OTELSampler implements Sampler {
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
  ): SamplingResult {
    return { decision: 2 };
  }

  toString(): string {
    return "OTELSampler";
  }
}

registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.ENV,
    "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
    env: process.env.ENV,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: process.env.OTEL_ACCESS_TOKEN,
    }),
  ],
  instrumentations: [createHttpInstrumentation()],
  traceSampler: new OTELSampler(),
});
