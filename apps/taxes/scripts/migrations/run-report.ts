/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, getMetadataManagerForEnv, verifyRequiredEnvs } from "./migration-utils";

dotenv.config();

const runReport = async () => {
  console.log("Starting running migration");

  verifyRequiredEnvs();

  console.log("Envs verified, fetching envs");
  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  const report = {
    default: [] as string[],
  };

  for (const env of allEnvs) {
    console.log("Working on env: ", env.saleorApiUrl);

    // const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token, env.appId);

    // migration logic

    // migration logic end

    const isMigrated = false;

    if (isMigrated) {
      report.default.push(env.saleorApiUrl);
    }
  }

  console.log("Report", report);
};

runReport();
