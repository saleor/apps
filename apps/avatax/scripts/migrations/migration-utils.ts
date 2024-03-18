import { SaleorCloudAPL } from "@saleor/app-sdk/APL";

export const verifyRequiredEnvs = () => {
  const requiredEnvs = ["REST_APL_TOKEN", "REST_APL_ENDPOINT"];

  if (!requiredEnvs.every((env) => process.env[env])) {
    throw new Error(`Missing environment variables: ${requiredEnvs.join(" | ")}`);
  }

  console.debug("All required environment variables are present");
};

export const fetchCloudAplEnvs = () => {
  const saleorAPL = new SaleorCloudAPL({
    token: process.env.REST_APL_TOKEN!,
    resourceUrl: process.env.REST_APL_ENDPOINT!,
  });

  return saleorAPL.getAll();
};
