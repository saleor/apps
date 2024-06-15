/* eslint-disable turbo/no-undeclared-env-vars */

import { SaleorCloudAPL } from "@saleor/app-sdk/APL";

export const verifyRequiredEnvs = () => {
  const requiredEnvs = ["REST_APL_TOKEN", "REST_APL_ENDPOINT"];

  if (!requiredEnvs.every((env) => process.env[env])) {
    throw new Error(`Missing envs: ${requiredEnvs.join(" | ")}`);
  }
};

export const fetchCloudAplEnvs = () => {
  const saleorAPL = new SaleorCloudAPL({
    token: process.env.REST_APL_TOKEN!,
    resourceUrl: process.env.REST_APL_ENDPOINT!,
  });

  return saleorAPL.getAll();
};
