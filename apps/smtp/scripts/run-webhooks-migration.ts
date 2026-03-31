import { parseArgs } from "node:util";

import { getAppDetailsAndWebhooksData, modifyAppWebhook } from "@saleor/webhook-utils";
import * as Sentry from "@sentry/nextjs";

import { env } from "../src/env";
import { createInstrumentedGraphqlClient } from "../src/lib/create-instrumented-graphql-client";
import { saleorApp } from "../src/saleor-app";
import { createMigrationScriptLogger } from "./migration-logger";
import { removeDigitalContentUrlFromQuery } from "./remove-digital-content-url-from-query";

const {
  values: { "dry-run": dryRun },
} = parseArgs({
  options: {
    "dry-run": {
      type: "boolean",
      default: false,
    },
  },
});

const logger = createMigrationScriptLogger("RemoveDigitalContentUrlMigration");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const runMigration = async () => {
  logger.info("Starting migration: Remove digitalContentUrl from OrderDetails");

  const saleorAPL = saleorApp.apl;

  const saleorCloudEnv = await saleorAPL.getAll().catch(() => {
    logger.error(`Could not fetch instances from the ${env.APL} APL`);

    process.exit(1);
  });

  await Promise.allSettled(
    saleorCloudEnv.map(async (saleorEnv) => {
      const { saleorApiUrl, token } = saleorEnv;

      logger.info(`Processing webhooks for ${saleorApiUrl}`);

      const client = createInstrumentedGraphqlClient({
        saleorApiUrl: saleorApiUrl,
        token: token,
      });

      try {
        const appDetails = await getAppDetailsAndWebhooksData({ client });

        const webhooks = appDetails.webhooks;

        if (!webhooks?.length) {
          logger.warn(`No webhooks found for ${saleorApiUrl}, skipping`);

          return;
        }

        const webhooksWithOrderDetails = webhooks.filter(
          (w) => w.query && w.query.includes("fragment OrderDetails on Order"),
        );

        if (!webhooksWithOrderDetails.length) {
          logger.info(`No webhooks with OrderDetails fragment found for ${saleorApiUrl}, skipping`);

          return;
        }

        logger.info(
          `Found ${webhooksWithOrderDetails.length} webhooks with OrderDetails fragment for ${saleorApiUrl}`,
        );

        for (const webhook of webhooksWithOrderDetails) {
          const result = removeDigitalContentUrlFromQuery(webhook.query);

          if (!result || !result.changed) {
            logger.info(
              `Webhook "${webhook.name}" (${webhook.id}) has no digitalContentUrl, skipping`,
            );

            continue;
          }

          logger.info(
            `Webhook "${webhook.name}" (${webhook.id}) needs update - removing digitalContentUrl`,
          );

          if (dryRun) {
            logger.info(`[DRY RUN] Would update webhook "${webhook.name}" (${webhook.id})`);

            continue;
          }

          await modifyAppWebhook({
            client,
            webhookId: webhook.id,
            input: {
              query: result.query,
            },
          });

          logger.info(`Updated webhook "${webhook.name}" (${webhook.id})`);
        }

        logger.info(`Migration finished successfully for ${saleorApiUrl}`);
      } catch (error) {
        logger.error(`Migration failed for ${saleorApiUrl}`, { error: String(error) });
        Sentry.captureException(error);
      }
    }),
  );
};

runMigration();

process.on("beforeExit", () => {
  logger.info(`Migration complete for all environments from ${env.APL} APL`);
  process.exit(0);
});
