import { SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { otelSdk } from "@saleor/apps-otel/src/instrumentation";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

import { createInstrumentedGraphqlClient } from "../src/lib/create-instrumented-graphql-client";
import { loggerContext } from "../src/logger-context";
import { appWebhooks } from "../webhooks";
import { createLogger } from "./migration-logger";

const requiredEnvs = ["REST_APL_TOKEN", "REST_APL_ENDPOINT"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

if (process.env.OTEL_ENABLED === "true" && process.env.OTEL_SERVICE_NAME) {
  otelSdk.start();
}

const logger = createLogger("RunWebhooksMigration");

const runMigrations = async () => {
  if (!requiredEnvs.every((env) => process.env[env])) {
    logger.error(`Missing environment variables: ${requiredEnvs.join(" | ")}`, { dryRun });
    process.exit(1);
  }

  logger.info(`Starting webhooks migration`, { dryRun });

  const saleorAPL = new SaleorCloudAPL({
    token: process.env.REST_APL_TOKEN!,
    resourceUrl: process.env.REST_APL_ENDPOINT!,
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
