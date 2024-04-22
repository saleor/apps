import { createLogger } from "@saleor/apps-logger";
import { otelWebhooksMigrationWrapper } from "@saleor/apps-otel";
import * as dotenv from "dotenv";
import { updateWebhooks } from "./update-webhooks";

dotenv.config();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const logger = createLogger("RunWebhooksMigration");

const runMigration = async () => {
  // Must use dynamic import for env variables to load properly
  const { fetchCloudAplEnvs, verifyRequiredEnvs } = await import("./migration-utils");

  logger.info(`Starting webhooks migration ${dryRun ? "(dry run)" : ""}`, { dryRun });

  verifyRequiredEnvs();

  logger.info("Fetching environments from the Cloud APL");

  const allEnvs = await fetchCloudAplEnvs().catch((error) => {
    logger.error("Could not fetch instances from the Cloud APL", error);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await updateWebhooks({ authData: env, dryRun });
  }

  logger.info(`Webhook migration ${dryRun ? "(dry run)" : ""} complete`, { dryRun });
};

otelWebhooksMigrationWrapper(runMigration);
