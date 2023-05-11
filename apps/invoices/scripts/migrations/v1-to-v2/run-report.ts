/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import {
  fetchCloudAplEnvs,
  getMetadataManagerForEnv,
  safeParse,
  verifyRequireEnvs,
} from "../migration-utils";

dotenv.config();

const runReport = async () => {
  verifyRequireEnvs();

  const allEnvs = await fetchCloudAplEnvs();

  const results = await Promise.all(
    // @ts-ignore todo fix APL typings
    allEnvs.results.map((env) => {
      const metadataManager = getMetadataManagerForEnv(env.saleor_api_url, env.token);

      return Promise.all([
        metadataManager.get("app-config", env.saleor_api_url),
        metadataManager.get("app-config-v2"),
      ])
        .then(([v1, v2]) => {
          return {
            schemaV1: safeParse(v1),
            schemaV2: safeParse(v2),
          };
        })
        .then((metadata) => ({
          metadata: metadata,
          env: env.saleor_api_url,
        }));
    })
  );

  const report = results.map((r: any) => ({
    env: r.env,
    hasV1: !!r.metadata.schemaV1,
    hasV2: !!r.metadata.schemaV2,
  }));

  const notMigratedCount = report.reduce((acc: number, curr: any) => {
    if (!curr.hasV2) {
      return acc + 1;
    }
    return acc;
  }, 0);

  console.table(report);
  console.log(`Envs left to migrate: ${notMigratedCount}`);
};

runReport();
