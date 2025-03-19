import * as dotenv from "dotenv";

import { saleorApp } from "../../src/saleor-app";
import { createMigrationScriptLogger } from "./migration-logger";
import { updateWebhooksScript } from "./update-webhooks";

dotenv.config();

const logger = createMigrationScriptLogger("WebhooksMigrationScript");

const runMigration = async () => {
  logger.info("Starting running migration");

  logger.info("Envs verified, fetching envs");

  const allEnvs = await saleorApp.apl.getAll().catch((r) => {
    logger.error("Could not fetch instances from the APL");
    logger.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    logger.info("Working on env: ", env.saleorApiUrl);
    await updateWebhooksScript({ authData: env, dryRun: false });
  }

  logger.info("Migration complete");
};

runMigration();
