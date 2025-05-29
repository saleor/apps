import { env } from "../../src/env";

export const isTestRunAgainstSaleor320AndLower = () => {
  const saleorVersion = env.E2E_SALEOR_VERSION;

  if (!saleorVersion) {
    throw new Error("SALEOR_VERSION environment variable is not set");
  }

  return saleorVersion.startsWith("320") || saleorVersion.startsWith("319");
};
