export type PayPalEnv = "SANDBOX" | "LIVE";

export const getPayPalApiUrl = (env: PayPalEnv): string => {
  return env === "LIVE"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
};
