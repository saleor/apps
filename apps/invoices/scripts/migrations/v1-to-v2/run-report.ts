/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import {
  fetchCloudAplEnvs,
  getMetadataManagerForEnv,
  safeParse,
  verifyRequiredEnvs,
} from "../migration-utils";
import { MigrationV1toV2Consts } from "./const";

dotenv.config();

const runReport = async () => {
  verifyRequiredEnvs();

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  const results = await Promise.all(
    allEnvs.map((env) => {
      const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token);

      return Promise.all([
        metadataManager.get(MigrationV1toV2Consts.appConfigV1metadataKey, env.saleorApiUrl),
        metadataManager.get(MigrationV1toV2Consts.appConfigV2metadataKey),
      ])
        .then(([v1, v2]) => {
          return {
            schemaV1: safeParse(v1),
            schemaV2: safeParse(v2),
          };
        })
        .then((metadata) => ({
          metadata: metadata,
          env: env.saleorApiUrl,
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
