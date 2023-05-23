import { AppConfig, SellerShopConfig } from "./app-config";

const getDefaultEmptyUrlConfiguration = (): SellerShopConfig["urlConfiguration"] => ({
  storefrontUrl: "",
  productStorefrontUrl: "",
});

const getDefaultEmptyPerChannelConfiguration = (): SellerShopConfig => ({
  urlConfiguration: getDefaultEmptyUrlConfiguration(),
  s3BucketConfiguration: undefined, //getDefaultEmptyS3BucketConfiguration(),
});

const getChannelUrlConfiguration =
  (appConfig: AppConfig | null | undefined) => (channelSlug: string) => {
    try {
      return appConfig?.shopConfigPerChannel[channelSlug].urlConfiguration ?? null;
    } catch (e) {
      return null;
    }
  };

const setChannelUrlConfiguration =
  (appConfig: AppConfig | null | undefined) =>
  (channelSlug: string) =>
  (urlConfiguration: SellerShopConfig["urlConfiguration"]) => {
    const appConfigNormalized = structuredClone(appConfig) ?? { shopConfigPerChannel: {} };

    appConfigNormalized.shopConfigPerChannel[channelSlug] ??=
      getDefaultEmptyPerChannelConfiguration();

    appConfigNormalized.shopConfigPerChannel[channelSlug].urlConfiguration = urlConfiguration;

    return appConfigNormalized;
  };

const getChannelS3BucketConfiguration =
  (appConfig: AppConfig | null | undefined) => (channelSlug: string) => {
    try {
      return appConfig?.shopConfigPerChannel[channelSlug].s3BucketConfiguration ?? null;
    } catch (e) {
      return null;
    }
  };

const setChannelS3BucketConfiguration =
  (appConfig: AppConfig | null | undefined) =>
  (channelSlug: string) =>
  (s3BucketConfiguration: SellerShopConfig["s3BucketConfiguration"]) => {
    const appConfigNormalized = structuredClone(appConfig) ?? { shopConfigPerChannel: {} };

    appConfigNormalized.shopConfigPerChannel[channelSlug].s3BucketConfiguration =
      s3BucketConfiguration;

    return appConfigNormalized;
  };

export const AppConfigContainer = {
  getChannelUrlConfiguration,
  setChannelUrlConfiguration,
  getChannelS3BucketConfiguration,
  setChannelS3BucketConfiguration,
};
