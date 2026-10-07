import { createAppDeprecationCronHandler } from "@saleor/app-deprecation";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { type NextApiHandler } from "next";

import { env } from "@/env";
import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { DEPRECATION_REASON } from "@/modules/deprecation/deprecation-reason";
import { apl } from "@/saleor-app";

const handler = createAppDeprecationCronHandler({
  cronSecret: env.CRON_SECRET,
  apl,
  createClient: createInstrumentedGraphqlClient,
  reason: DEPRECATION_REASON,
  logger: createLogger("set-deprecation-cron"),
  parallelCalls: env.DEPRECATION_CRON_PARALLEL_CALLS,
  requestTimeoutMs: env.DEPRECATION_CRON_REQUEST_TIMEOUT_MS,
});

export default compose<NextApiHandler>(
  (h) => wrapWithLoggerContext(h, loggerContext),
  withSpanAttributes,
)(handler);
