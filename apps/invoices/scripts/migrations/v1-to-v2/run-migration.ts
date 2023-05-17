/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import {
  fetchCloudAplEnvs,
  getMetadataManagerForEnv,
  safeParse,
  verifyRequiredEnvs,
} from "../migration-utils";
import { ConfigV1ToV2Transformer } from "../../../src/modules/app-configuration/schema-v2/config-v1-to-v2-transformer";
import { AppConfigV2MetadataManager } from "../../../src/modules/app-configuration/schema-v2/app-config-v2-metadata-manager";
import { AppConfigV2 } from "../../../src/modules/app-configuration/schema-v2/app-config";
import { MigrationV1toV2Consts } from "./const";

dotenv.config();

const runMigration = async () => {
  verifyRequiredEnvs();

  const allEnvs = await fetchCloudAplEnvs();

  const results = await Promise.all(
    allEnvs.map((env) => {
      const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token);

      return Promise.all([
        metadataManager.get(MigrationV1toV2Consts.appConfigV1metadataKey, env.saleorApiUrl),
        metadataManager.get(MigrationV1toV2Consts.appConfigV2metadataKey),
      ])
        .then(([v1, v2]) => {
          if (v2 && v2 !== "undefined") {
            console.log("▶️ v2 already exists for ", env.saleorApiUrl);
            return;
          }

          if (!v1) {
            console.log("🚫 v1 does not exist for ", env.saleorApiUrl);

            return new AppConfigV2MetadataManager(metadataManager)
              .set(new AppConfigV2().serialize())
              .then((r) => {
                console.log(`✅ created empty config for ${env.saleorApiUrl}`);
              })
              .catch((e) => {
                console.log(
                  `🚫 failed to create empty config for ${env.saleorApiUrl}. Env may not exist.`,
                  e.message
                );
              });
          }

          const v2Config = new ConfigV1ToV2Transformer().transform(JSON.parse(v1));

          return new AppConfigV2MetadataManager(metadataManager)
            .set(v2Config.serialize())
            .then((r) => {
              console.log(`✅ migrated ${env.saleorApiUrl}`);
            });
        })
        .catch((e) => {
          console.error("🚫 Failed to migrate ", env.saleorApiUrl, e);
        });
    })
  );
};

runMigration();
