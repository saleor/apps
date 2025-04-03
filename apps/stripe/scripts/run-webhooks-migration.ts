import { parseArgs } from "node:util";

import { WebhookManifest } from "@saleor/app-sdk/types";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { saleorApp } from "@/lib/saleor-app";

import { createMigrationScriptLogger } from "./migration-logger";

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

const logger = createMigrationScriptLogger("WebhooksMigrationScript");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const runMigrations = async () => {
  logger.info(`Starting webhooks migration`);

  const saleorAPL = saleorApp.apl;

  const saleorCloudEnv = await saleorAPL.getAll().catch(() => {
    logger.error(`Could not fetch instances from the ${env.APL} APL`);

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const enabled = webhooks.some((w) => w.isActive);

          const targetUrl = appDetails.appUrl;

          if (!targetUrl?.length) {
            logger.error("App has no defined appUrl, skipping");

            return [];
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const baseUrl = new URL(targetUrl).origin;

          const appWebhooks: WebhookManifest[] = []; // TODO: Replace with actual webhooks

          return appWebhooks;
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
