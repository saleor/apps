/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { orderConfirmedAsyncWebhook } from "../../src/pages/api/webhooks/order-confirmed";
import { createAppWebhookMigrator } from "./app-webhook-migrator";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { migrateTaxes } from "./taxes-migration";

dotenv.config();

const runReport = async () => {
  console.log("Starting runReport");

  verifyRequiredEnvs();

  console.log("Env vars verified. Fetching envs");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    console.log("Working on env:", env);

    const webhookMigrator = createAppWebhookMigrator(env, { mode: "report" });

    migrateTaxes(webhookMigrator);
  }
};

runReport();
