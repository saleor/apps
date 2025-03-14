import { WebhookManifest } from "@saleor/app-sdk/types";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";
import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { apl } from "@/saleor-app";

import { appWebhooks } from "../src/modules/webhooks/webhooks";
import { createMigrationScriptLogger } from "./migration-logger";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const logger = createMigrationScriptLogger("WebhooksMigrationScript");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  ignoreErrors: [],
  integrations: [],
});

const runMigrations = async () => {
  logger.info(`Starting webhooks migration`);
  logger.info(`Fetching environments from the ${env.APL} APL`);

  const saleorCloudEnv = await apl.getAll().catch(() => {
    logger.error(`Could not fetch instances from ${env.APL} APL`);

    process.exit(1);
  });

  await Promise.allSettled(
    saleorCloudEnv.map(async (saleorEnv) => {
      const { saleorApiUrl, token } = saleorEnv;

      logger.info(`Migrating webhooks for ${saleorApiUrl}`);

      const client = createInstrumentedGraphqlClient({
        saleorApiUrl: saleorApiUrl,
        token: token,
      });

      const runner = new WebhookMigrationRunner({
        dryRun,
        logger,
        client,
        saleorApiUrl,
        getManifests: async ({ appDetails }) => {
          const webhooks = appDetails.webhooks;

          if (!webhooks?.length) {
            logger.warn("The environment does not have any webhooks, skipping");
            return [];
          }

          // All webhooks in this application are turned on or off. If any of them is enabled, we enable all of them.
          const enabled = webhooks.some((w) => w.isActive);

          const targetUrl = appDetails.appUrl;

          if (!targetUrl?.length) {
            logger.error("App has no defined appUrl, skipping");
            return [];
          }

          const baseUrl = new URL(targetUrl).origin;

          return appWebhooks.map((w) => {
            const manifest: WebhookManifest = {
              ...w.getWebhookManifest(baseUrl),
              isActive: enabled,
            };

            return manifest;
          });
        },
      });

      await runner.migrate().catch((error) => {
        Sentry.captureException(error);
      });
    }),
  );
};

runMigrations();

process.on("beforeExit", () => {
  logger.info(`Webhook migration complete for all environments from ${env.APL} APL`);
  process.exit(0);
});
