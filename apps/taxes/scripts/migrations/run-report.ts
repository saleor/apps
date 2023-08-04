/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { AppWebhookMigrator } from "./app-webhook-migrator";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";

dotenv.config();

const runReport = async () => {
  console.log("Starting runReport");

  verifyRequiredEnvs();

  console.log("Env vars verified. Fetching envs");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  // for testing purposes
  const firstTenEnvs = allEnvs.slice(0, 10);

  for (const env of firstTenEnvs) {
    console.log("Working on env:", env);

    const webhookMigrator = new AppWebhookMigrator(
      {
        apiUrl: env.saleorApiUrl,
        appToken: env.token,
        appId: env.appId,
      },
      { mode: "report" }
    );

    webhookMigrator.getAppWebhooks();
  }
};

runReport();
