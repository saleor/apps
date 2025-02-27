import { createMetricReader } from "@saleor/apps-otel/src/metric-reader-factory";

import { env } from "@/env";

export const otelMetricsReader = createMetricReader({
  accessToken: env.OTEL_ACCESS_TOKEN,
  exportIntervalMillis: 20_000, // max lambda execution time
});
