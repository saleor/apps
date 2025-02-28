import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";

import { env } from "@/env";

export const spanProcessor = createBatchSpanProcessor({
  accessToken: env.OTEL_ACCESS_TOKEN,
});
