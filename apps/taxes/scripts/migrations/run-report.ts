/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { AppWebhookMigrator } from "./app-webhook-migrator";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { orderConfirmedAsyncWebhook } from "../../src/pages/api/webhooks/order-confirmed";

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

    const webhookMigrator = new AppWebhookMigrator(
      {
        apiUrl: env.saleorApiUrl,
        appToken: env.token,
        appId: env.appId,
      },
      { mode: "report" }
    );

    webhookMigrator.migrateWebhook("OrderCreated", orderConfirmedAsyncWebhook);
  }
};

runReport();
