import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { withCronAuthAppRouter } from "@saleor/apps-shared/cron";
import { cleanupStaleInstallations } from "@saleor/stale-installations-cleanup";

import { env } from "@/lib/env";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { apl } from "@/lib/saleor-app";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createRemoveInstallationStripeWebhooks } from "@/modules/stripe/remove-installation-stripe-webhooks";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";

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
    deleteAppData: createRemoveInstallationStripeWebhooks({
      configRepo: appConfigRepoImpl,
      webhookManager: new StripeWebhookManager(),
    }),
  });

  return Response.json(body, { status });
});

export const GET = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);

export const maxDuration = 300;
