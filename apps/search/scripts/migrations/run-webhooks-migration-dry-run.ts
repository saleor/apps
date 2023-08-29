/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { recreateWebhooks } from "./recreate-webhooks";

dotenv.config();

const runMigration = async () => {
  console.log("Starting webhooks migration (dry run)");

  verifyRequiredEnvs();

  console.log("Envs verified, fetching envs");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error("Could not fetch instances from the APL");
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await recreateWebhooks({ authData: env, dryRun: true });
  }

  console.log("Migration dry run complete");
};

runMigration();
