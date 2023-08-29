/* eslint-disable turbo/no-undeclared-env-vars */

import { SaleorCloudAPL } from "@saleor/app-sdk/APL";

export const verifyRequiredEnvs = () => {
  const requiredEnvs = ["SALEOR_CLOUD_TOKEN", "SALEOR_CLOUD_RESOURCE_URL"];

  if (!requiredEnvs.every((env) => process.env[env])) {
    throw new Error(`Missing envs: ${requiredEnvs.join(" | ")}`);
  }
};

export const fetchCloudAplEnvs = () => {
  const saleorAPL = new SaleorCloudAPL({
    token: process.env.SALEOR_CLOUD_TOKEN!,
    resourceUrl: process.env.SALEOR_CLOUD_RESOURCE_URL!,
  });

  return saleorAPL.getAll();
};
