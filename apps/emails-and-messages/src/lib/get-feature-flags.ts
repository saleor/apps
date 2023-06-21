import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared";

export const featureFlags = ["giftCardSentEvent"] as const;

export type FeatureFlag = (typeof featureFlags)[number];

export type FeatureFlagsState = Record<FeatureFlag, boolean>;

interface GetFeatureFlagsArgs {
  saleorVersion: string;
}

export const getFeatureFlags = ({ saleorVersion }: GetFeatureFlagsArgs): FeatureFlagsState => {
  // TODO: investigate coerse setting to handle XX.YY version scheme
  return {
    giftCardSentEvent: new SaleorVersionCompatibilityValidator(">=3.13").isValid(saleorVersion),
  };
};
