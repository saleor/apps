import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createAwsInstrumentation } from "@saleor/apps-otel/src/aws-instrumentation-factory";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { registerOTel } from "@vercel/otel";

import { env } from "@/env";

import { Context, Sampler, SamplingResult, SpanKind } from "@opentelemetry/api";
import pkg from "../../package.json";

export class OTELSampler implements Sampler {
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
  serviceName: env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
    [ObservabilityAttributes.COMMIT_SHA]: env.VERCEL_GIT_COMMIT_SHA,
    [ObservabilityAttributes.REPOSITORY_URL]: env.REPOSITORY_URL,
    // override attribute set by `@vercel/otel` - if you are using OSS version you can remove it
    env: undefined,
    [ObservabilityAttributes.VERCEL_ENV]: env.VERCEL_ENV,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: env.OTEL_ACCESS_TOKEN,
    }),
  ],
  instrumentations: [createAwsInstrumentation(), createHttpInstrumentation()],
  traceSampler: new OTELSampler(),
});
