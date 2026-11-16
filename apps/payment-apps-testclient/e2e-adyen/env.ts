const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Cannot run Adyen e2e tests: ${name} is not set`);
  }

  return value;
};

export const adyenE2eEnv = {
  saleorApiUrl: required("ADYEN_E2E_SALEOR_API_URL"),
  chargeChannelSlug: required("ADYEN_E2E_CHARGE_CHANNEL_SLUG"),
  authorizationChannelSlug: required("ADYEN_E2E_AUTHORIZATION_CHANNEL_SLUG"),
  // app.saleor.adyen_staging on staging Saleor environments.
  appId: required("ADYEN_E2E_APP_ID"),
};
