import * as dotenv from "dotenv";

import { saleorApp } from "../../saleor-app";
import { createMigrationScriptLogger } from "./migration-logger";
import { updateWebhooksScript } from "./update-webhooks";

dotenv.config();

const logger = createMigrationScriptLogger("DryRunWebhooksMigrationScript");

const runMigration = async () => {
  logger.info("Starting webhooks migration (dry run)");

  const allEnvs = await saleorApp.apl.getAll().catch((r) => {
    logger.error("Could not fetch instances from the APL");
    logger.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await updateWebhooksScript({ authData: env, dryRun: true });
  }

  logger.info("Migration dry run complete");
};

runMigration();
