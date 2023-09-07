/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { updateWebhooksScript } from "./update-webhooks";

dotenv.config();

const runMigration = async () => {
  console.log("Starting running migration");

  verifyRequiredEnvs();

  console.log("Envs verified, fetching envs");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error("Could not fetch instances from the APL");
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await updateWebhooksScript({ authData: env, dryRun: false });
  }

  console.log("Migration complete");
};

runMigration();
