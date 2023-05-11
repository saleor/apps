/* eslint-disable turbo/no-undeclared-env-vars */

import { createClient } from "../../src/lib/graphql";
import { createSettingsManager } from "../../src/modules/app-configuration/metadata-manager";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL";

export const getMetadataManagerForEnv = (apiUrl: string, appToken: string) => {
  const client = createClient(apiUrl, async () => ({
    token: appToken,
  }));

  return createSettingsManager(client);
};

export const safeParse = (json?: string) => {
  if (!json) return null;

  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const verifyRequireEnvs = () => {
  const requiresEnvs = ["SALEOR_CLOUD_TOKEN", "SALEOR_CLOUD_RESOURCE_URL", "SECRET_KEY"];

  if (!requiresEnvs.every((env) => process.env[env])) {
    throw new Error(`Missing envs: ${requiresEnvs.join(" | ")}`);
  }
};

export const fetchCloudAplEnvs = () => {
  const saleorAPL = new SaleorCloudAPL({
    token: process.env.SALEOR_CLOUD_TOKEN!,
    resourceUrl: process.env.SALEOR_CLOUD_RESOURCE_URL!,
  });

  return saleorAPL.getAll();
};
