import { envE2e } from "../env-e2e";

// TODO: dead helper - app requires Saleor >=3.22, so 3.20 is no longer tested against.

export const isTestRunAgainstSaleor320AndLower = () => {
  const saleorVersion = envE2e.E2E_SALEOR_VERSION;

  if (!saleorVersion) {
    throw new Error("SALEOR_VERSION environment variable is not set");
  }

  return saleorVersion.startsWith("320");
};
