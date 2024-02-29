/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { createAppWebhookMigrator } from "./app-webhook-migrator";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { migrateAvatax } from "./1.1-avatax-migration";

dotenv.config();

const runMigration = async () => {
  console.log("Starting runMigration");

  verifyRequiredEnvs();

  console.log("Env vars verified. Fetching envs");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    try {
      console.log("--------------------");
      console.log(`Working on app: ${env.appId} on domain ${env.domain}`);

      const webhookMigrator = createAppWebhookMigrator(env, { mode: "migrate" });

      await migrateAvatax(webhookMigrator);
    } catch (error) {
      console.log("⏩ Error while migrating webhook. Continuing with the next app.");
      continue;
    }
  }
};

runMigration();
