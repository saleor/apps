import { createMetricReader } from "@saleor/apps-otel/src/metric-reader-factory";

import { env } from "@/env";

export const metricReader = createMetricReader({
  accessToken: env.OTEL_ACCESS_TOKEN!,
  exportIntervalMillis: 60_000,
});
