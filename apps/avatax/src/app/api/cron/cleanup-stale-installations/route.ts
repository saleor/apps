import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { withCronAuthAppRouter } from "@saleor/apps-shared/cron";
import { cleanupStaleInstallations } from "@saleor/stale-installations-cleanup";

import { env } from "@/env";
import { withFlushOtelMetrics } from "@/lib/otel/with-flush-otel-metrics";
import { createLogger } from "@/logger";
import { withLoggerContext } from "@/logger-context";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

import { apl } from "../../../../../saleor-app";

const logger = createLogger("cleanup-stale-installations-cron");
const table = env.APL === "dynamodb" ? dynamoMainTable : undefined;

const handler = withCronAuthAppRouter({ secret: env.CRON_SECRET, logger }, async () => {
  const { status, body } = await cleanupStaleInstallations({
    getInstallations: () => apl.getAll(),
    table,
    cloudApiUrl: env.SALEOR_CLOUD_API_URL,
    oidcAudience: env.SALEOR_CLOUD_OIDC_AUDIENCE,
    rootDomains: env.SALEOR_CLOUD_ROOT_DOMAINS,
    dryRun: env.STALE_INSTALLATIONS_CLEANUP_DRY_RUN,
    logger,
  });

  return Response.json(body, { status });
});

export const GET = compose(
  withLoggerContext,
  withFlushOtelMetrics,
  withSpanAttributesAppRouter,
)(handler);

export const maxDuration = 300;
