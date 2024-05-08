import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared";

export const featureFlags = ["giftCardSentEvent", "orderRefundedEvent"] as const;

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
    giftCardSentEvent: new SaleorVersionCompatibilityValidator(">=3.13").isValid(saleorVersion),
    orderRefundedEvent: new SaleorVersionCompatibilityValidator(">=3.14").isValid(saleorVersion),
  };
};
