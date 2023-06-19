/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "../migration-utils";
import { RemoveMetadataDocument } from "../../../generated/graphql";
import { MigrationV1toV2Consts } from "./const";
import { createGraphQLClient } from "@saleor/apps-shared";

dotenv.config();

const runMigration = async () => {
  verifyRequiredEnvs();

  const allEnvs = await fetchCloudAplEnvs();

  const results = await Promise.all(
    allEnvs.map((env) => {
      const client = createGraphQLClient({
        saleorApiUrl: env.saleorApiUrl,
        token: env.token,
      });

      return client
        .mutation(RemoveMetadataDocument, {
          id: env.appId,
          keys: [MigrationV1toV2Consts.appConfigV2metadataKey],
        })
        .toPromise()
        .then((r) => {
          if (r.error) {
            console.error("❌ Error removing metadata", r.error.message);
            throw r.error.message;
          }

          return r;
        })
        .catch((e) => {
          console.error("❌ Error removing metadata", e);
        });
    })
  );

  console.log(results);
};

runMigration();
