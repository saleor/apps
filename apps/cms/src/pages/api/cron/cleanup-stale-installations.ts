import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { withCronAuth } from "@saleor/apps-shared/cron";
import { cleanupStaleInstallations } from "@saleor/stale-installations-cleanup";

import { env } from "@/env";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { apl, dynamoMainTable } from "@/saleor-app";

const logger = createLogger("cleanup-stale-installations-cron");
const table = dynamoMainTable;

const handler = withCronAuth({ secret: env.CRON_SECRET, logger }, async (_req, res) => {
  const { status, body } = await cleanupStaleInstallations({
    getInstallations: () => apl.getAll(),
    table,
    cloudApiUrl: env.SALEOR_CLOUD_API_URL,
    oidcAudience: env.SALEOR_CLOUD_OIDC_AUDIENCE,
    rootDomains: env.SALEOR_CLOUD_ROOT_DOMAINS,
    dryRun: env.STALE_INSTALLATIONS_CLEANUP_DRY_RUN,
    logger,
  });

  return res.status(status).json(body);
});

export default wrapWithLoggerContext(withSpanAttributes(handler), loggerContext);
