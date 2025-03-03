/* eslint-disable node/no-process-env */
import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { registerOTel } from "@vercel/otel";

import pkg from "../package.json";

registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.ENV,
    "commit-sha": process.env.VERCEL_GIT_COMMIT_SHA,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: process.env.OTEL_ACCESS_TOKEN!,
    }),
  ],
});
