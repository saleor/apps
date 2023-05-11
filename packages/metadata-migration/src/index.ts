/* eslint-disable turbo/no-undeclared-env-vars */

import { createSettingsManager } from "./metadata-manager";
import { createClient } from "./graphql-client";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL";

const getMetadataManagerForEnv = (apiUrl: string, appToken: string) => {
  const client = createClient(apiUrl, async () => ({
    token: appToken,
  }));

  return createSettingsManager(client);
};

const safeParse = (json?: string) => {
  if (!json) return null;

  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

const run = async () => {
  console.log("RUN");

  const saleorAPL = new SaleorCloudAPL({
    token: process.env.SALEOR_CLOUD_TOKEN!,
    resourceUrl: process.env.SALEOR_CLOUD_RESOURCE_URL!,
  });

  const allEnvs = await saleorAPL.getAll();

  const results = await Promise.all(
    // @ts-ignore todo fix APL typings
    allEnvs.results.map((env) => {
      const metadataManager = getMetadataManagerForEnv(env.saleor_api_url, env.token);

      return Promise.all([
        metadataManager.get("app-config"),
        metadataManager.get("app-config-v2"),
      ]).then(([v1, v2]) => {
        return {
          schemaV1: safeParse(v1),
          schemaV2: safeParse(v2),
        };
      });
    })
  );

  console.log(results);
};

run();
