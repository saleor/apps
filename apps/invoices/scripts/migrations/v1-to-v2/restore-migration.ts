/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, verifyRequireEnvs } from "../migration-utils";
import { createClient } from "../../../src/lib/graphql";
import { RemoveMetadataDocument } from "../../../generated/graphql";

dotenv.config();

const runMigration = async () => {
  verifyRequireEnvs();

  const allEnvs = await fetchCloudAplEnvs();

  const results = await Promise.all(
    allEnvs.map((env) => {
      const client = createClient(env.saleorApiUrl, async () => ({
        token: env.token,
      }));

      return client
        .mutation(RemoveMetadataDocument, {
          id: env.appId,
          keys: ["app-config-v2"],
        })
        .toPromise()
        .then((r) => {
          if (r.error) {
            console.error("❌ Error removing metadata", r.error.message);
            throw r.error.message;
          }

          return r;
        })
        .catch((e) => {});
    })
  );

  console.log(results);
};

runMigration();
