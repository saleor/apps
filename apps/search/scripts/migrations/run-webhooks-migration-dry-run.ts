/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";

import { fetchAplEnvs } from "./migration-utils";
import { updateWebhooksScript } from "./update-webhooks";

dotenv.config();

const runMigration = async () => {
  console.log("Starting webhooks migration (dry run)");

  const allEnvs = await fetchAplEnvs().catch((r) => {
    console.error("Could not fetch instances from the APL");
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await updateWebhooksScript({ authData: env, dryRun: true });
  }

  console.log("Migration dry run complete");
};

runMigration();
