import { AppConfig, SellerShopConfig } from "./app-config";

const getDefaultEmptyUrlConfiguration = (): SellerShopConfig["urlConfiguration"] => ({
  storefrontUrl: "",
  productStorefrontUrl: "",
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

    appConfigNormalized.shopConfigPerChannel[channelSlug] ??= {
      urlConfiguration: getDefaultEmptyUrlConfiguration(),
    };
    appConfigNormalized.shopConfigPerChannel[channelSlug].urlConfiguration = urlConfiguration;

    return appConfigNormalized;
  };

export const AppConfigContainer = {
  getChannelUrlConfiguration: getChannelUrlConfiguration,
  setChannelUrlConfiguration: setChannelUrlConfiguration,
};
