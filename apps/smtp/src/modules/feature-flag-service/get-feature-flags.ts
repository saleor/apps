import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared/saleor-version-compatibility-validator";

export const featureFlags = ["giftCardPaymentMethodDetails"] as const;

export type FeatureFlag = (typeof featureFlags)[number];

export type FeatureFlagsState = Record<FeatureFlag, boolean>;

interface GetFeatureFlagsArgs {
  saleorVersion: string;
}

/*
 * Returns list of feature flags based on Saleor version.
 * `saleorVersion` is expected to be in Semver format, e.g. "3.13.0"
 */
export const getFeatureFlags = ({ saleorVersion }: GetFeatureFlagsArgs): FeatureFlagsState => {
  return {
    // GiftCardPaymentMethodDetails type was added to the schema in 3.23
    giftCardPaymentMethodDetails: new SaleorVersionCompatibilityValidator(">=3.23").isValid(
      saleorVersion,
    ),
  };
};
