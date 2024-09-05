/* eslint-disable turbo/no-undeclared-env-vars */
import { aplType,saleorApp } from "../../saleor-app";

export const verifyRequiredEnvs = () => {
  if (aplType == "file") return;

  const requiredEnvs = ["REST_APL_TOKEN", "REST_APL_ENDPOINT"];

  if (!requiredEnvs.every((env) => process.env[env])) {
    throw new Error(`Missing envs: ${requiredEnvs.join(" | ")}`);
  }
};

export const fetchAplEnvs = () => {
  const saleorAPL = saleorApp.apl;

  return saleorAPL.getAll();
};
