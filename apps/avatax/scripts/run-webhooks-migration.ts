import { SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { otelSdk } from "@saleor/apps-otel/src/instrumentation";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

import { env } from "@/env";

import { createInstrumentedGraphqlClient } from "../src/lib/create-instrumented-graphql-client";
import { loggerContext } from "../src/logger-context";
import { appWebhooks } from "../webhooks";
import { createLogger } from "./migration-logger";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

if (env.OTEL_ENABLED && env.OTEL_SERVICE_NAME) {
  otelSdk.start();
}

const logger = createLogger("RunWebhooksMigration");

const runMigrations = async () => {
  logger.info(`Starting webhooks migration`, { dryRun });

  if (!env.REST_APL_TOKEN || !env.REST_APL_ENDPOINT) {
    logger.error("REST_APL_TOKEN and REST_APL_ENDPOINT must be set", { dryRun });
    process.exit(1);
  }

  const saleorAPL = new SaleorCloudAPL({
    token: env.REST_APL_TOKEN,
    resourceUrl: env.REST_APL_ENDPOINT,
  });

  logger.info("Fetching environments from the saleor-cloud APL", { dryRun });

  const saleorCloudEnv = await saleorAPL.getAll().catch((error) => {
    logger.error("Could not fetch instances from the Cloud APL", { error: error, dryRun });

    process.exit(1);
  });

  for (const saleorEnv of saleorCloudEnv) {
    await loggerContext.wrap(async () => {
      const { saleorApiUrl, token } = saleorEnv;

      loggerContext.set("dryRun", dryRun.toString());
      loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);

      logger.info(`Migrating webhooks for ${saleorApiUrl}`);

      const client = createInstrumentedGraphqlClient({
        saleorApiUrl: saleorApiUrl,
        token: token,
      });

      const runner = new WebhookMigrationRunner({
        dryRun,
        logger,
        client,
        getManifests: async ({ appDetails, instanceDetails }) => {
          if (instanceDetails.version) {
            loggerContext.set(
              ObservabilityAttributes.SALEOR_VERSION,
              instanceDetails.version?.toFixed(2),
            );
          }

          const webhooks = appDetails.webhooks;

          if (!webhooks?.length) {
            logger.warn("The environment does not have any webhooks, skipping");
            return [];
          }

          const enabled = webhooks.some((w) => w.isActive);

          const targetUrl = appDetails.appUrl;

          if (!targetUrl?.length) {
            logger.error("App has no defined appUrl, skipping");
            return [];
          }

          const baseUrl = new URL(targetUrl).origin;

          // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
          return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), isActive: enabled }));
        },
      });

      await runner.migrate();
    });
  }
};

runMigrations();

process.on("beforeExit", () => {
  logger.info(`Webhook migration complete for all environments from saleor-cloud APL`, { dryRun });
  otelSdk.shutdown().finally(() => process.exit(0));
});
