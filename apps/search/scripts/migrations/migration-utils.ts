/* eslint-disable turbo/no-undeclared-env-vars */
import { saleorApp } from "../../saleor-app";

export const fetchAplEnvs = () => {
  const saleorAPL = saleorApp.apl;

  return saleorAPL.getAll();
};
