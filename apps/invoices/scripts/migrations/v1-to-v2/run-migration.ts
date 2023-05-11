/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import {
  fetchCloudAplEnvs,
  getMetadataManagerForEnv,
  safeParse,
  verifyRequireEnvs,
} from "../migration-utils";
import { ConfigV1ToV2Transformer } from "../../../src/modules/app-configuration/schema-v2/config-v1-to-v2-transformer";
import { AppConfigV2MetadataManager } from "../../../src/modules/app-configuration/schema-v2/app-config-v2-metadata-manager";
import { AppConfigV2 } from "../../../src/modules/app-configuration/schema-v2/app-config";

dotenv.config();

const runMigration = async () => {
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
          if (v2) {
            console.log("▶️ v2 already exists for ", env.saleor_api_url);
            return;
          }

          if (!v1) {
            console.log("🚫 v1 does not exist for ", env.saleor_api_url);

            return new AppConfigV2MetadataManager(metadataManager)
              .set(new AppConfigV2().serialize())
              .then((r) => {
                console.log(`✅ created empty config for ${env.saleor_api_url}`);
              })
              .catch((e) => {
                console.log(
                  `🚫 failed to create empty config for ${env.saleor_api_url}. Env may not exist.`,
                  e.message
                );
              });
          }

          const v2Config = new ConfigV1ToV2Transformer().transform(JSON.parse(v1));

          return new AppConfigV2MetadataManager(metadataManager)
            .set(v2Config.serialize())
            .then((r) => {
              console.log(`✅ migrated ${env.saleor_api_url}`);
            });
        })
        .catch((e) => {
          console.error("🚫 Failed to migrate ", env.saleor_api_url, e);
        });
    })
  );
};

runMigration();
