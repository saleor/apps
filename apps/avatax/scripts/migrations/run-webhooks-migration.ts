import { otelSdk } from "@saleor/apps-otel/src/instrumentation";
import * as dotenv from "dotenv";
import { createLogger } from "../../src/logger";
import { updateWebhooks } from "./update-webhooks";

dotenv.config();
otelSdk.start();

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

  try {
    for (const env of allEnvs) {
      await updateWebhooks({ authData: env, dryRun, logger });
    }
  } catch (error) {
    console.error("Errp", error);
  }

  logger.info(`Webhook migration ${dryRun ? "(dry run)" : ""} complete`, { dryRun });
};

runMigration();

process.on("beforeExit", () => {
  otelSdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
