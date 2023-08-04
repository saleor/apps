/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { AppWebhookMigrator } from "./app-webhook-migrator";
import { fetchCloudAplEnv, verifyRequiredEnvs } from "./migration-utils";

dotenv.config();

const runTarget = async (saleorApiUrl: string) => {
  console.log("Starting runTarget");

  verifyRequiredEnvs();

  console.log("Env vars verified. fetching env");

  const env = await fetchCloudAplEnv(saleorApiUrl).catch((r) => {
    console.error(r);

    process.exit(1);
  });

  if (!env) {
    console.error("Env not found");

    process.exit(1);
  }

  const webhookMigrator = new AppWebhookMigrator({
    apiUrl: saleorApiUrl,
    appToken: env.token,
    appId: env.appId,
  });

  /*
   * await webhookUpdater.registerWebhookIfItDoesntExist(orderConfirmedAsyncWebhook);
   * await webhookMigrator.rollbackWebhookMigrations([orderConfirmedAsyncWebhook]);
   */
};

runTarget("");
