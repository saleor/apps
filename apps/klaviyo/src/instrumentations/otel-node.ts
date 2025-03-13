import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { registerOTel } from "@vercel/otel";

import pkg from "../../package.json";

registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.ENV,
    [ObservabilityAttributes.COMMIT_SHA]: process.env.VERCEL_GIT_COMMIT_SHA,
    [ObservabilityAttributes.REPOSITORY_URL]: process.env.REPOSITORY_URL,
    // override attribute set by `@vercel/otel` - if you are using OSS version you can remove it
    env: undefined,
    [ObservabilityAttributes.VERCEL_ENV]: process.env.VERCEL_ENV,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: process.env.OTEL_ACCESS_TOKEN,
    }),
  ],
  instrumentations: [createHttpInstrumentation()],
});
