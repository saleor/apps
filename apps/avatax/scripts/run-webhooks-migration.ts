import * as dotenv from "dotenv";

import { SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { otelSdk } from "@saleor/apps-otel/src/instrumentation";
import { WebhookMigrationRunner } from "@saleor/webhook-utils";

import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { createInstrumentedGraphqlClient } from "../src/lib/create-instrumented-graphql-client";
import { loggerContext } from "../src/logger-context";
import { appWebhooks } from "../webhooks";
import { createLogger } from "./logger";

dotenv.config();

const requiredEnvs = ["REST_APL_TOKEN", "REST_APL_ENDPOINT"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

if (process.env.OTEL_ENABLED === "true" && process.env.OTEL_SERVICE_NAME) {
  otelSdk.start();
}

const logger = createLogger("RunWebhooksMigration");

loggerContext.wrap(async () => {
  loggerContext.set("dryRun", dryRun.toString());

  if (!requiredEnvs.every((env) => process.env[env])) {
    logger.error(`Missing environment variables: ${requiredEnvs.join(" | ")}`);
    process.exit(1);
  }

  logger.info(`Starting webhooks migration`);

  const saleorAPL = new SaleorCloudAPL({
    token: process.env.REST_APL_TOKEN!,
    resourceUrl: process.env.REST_APL_ENDPOINT!,
  });

  logger.info("Fetching environments from the Cloud APL");

  const saleorCloudEnv = await saleorAPL.getAll().catch((error) => {
    logger.error("Could not fetch instances from the Cloud APL", error);

    process.exit(1);
  });

  for (const saleorEnv of saleorCloudEnv) {
    const { saleorApiUrl, token } = saleorEnv;

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
          logger.info("The environment does not have any webhooks, skipping");
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
        return appWebhooks.map((w) => ({ ...w.getWebhookManifest(baseUrl), enabled }));
      },
    });

    await runner.migrate();
  }

  logger.info(`Webhook migration complete`);
});

process.on("beforeExit", () => {
  otelSdk.shutdown().finally(() => process.exit(0));
});
