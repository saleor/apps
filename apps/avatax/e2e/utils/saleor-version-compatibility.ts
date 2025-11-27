import { envE2e } from "../env-e2e";

export const isTestRunAgainstSaleor320AndLower = () => {
  const saleorVersion = envE2e.E2E_SALEOR_VERSION;

  if (!saleorVersion) {
    throw new Error("SALEOR_VERSION environment variable is not set");
  }

  return saleorVersion.startsWith("320");
};
