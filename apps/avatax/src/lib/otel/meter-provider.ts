import { Resource } from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions/incubating";
import { createMetricsReader } from "@saleor/apps-otel/src/metrics-reader-factory";

import { env } from "@/env";

import { sharedServiceInstanceId } from "./shared-service-instance-id";

export const meterProvider = new MeterProvider({
  readers: [
    createMetricsReader({
      accessToken: env.OTEL_ACCESS_TOKEN,
    }),
  ],
  // Create new resource as `@vercel/otel` creates its own under the hood and don't expose it
  resource: new Resource({
    // We don't add all attributes from `instrumentations/otel-node.ts` as they will end up as attributes on the metrics in our OTEL collector. If you are using OSS version you can add them here.
    [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
    [ATTR_SERVICE_INSTANCE_ID]: sharedServiceInstanceId,
  }),
});
