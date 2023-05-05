import { AppConfig, SellerShopConfig } from "./app-config";

const getDefaultEmptyAddress = (): SellerShopConfig["address"] => ({
  city: "",
  cityArea: "",
  companyName: "",
  country: "",
  countryArea: "",
  postalCode: "",
  streetAddress1: "",
  streetAddress2: "",
});

const getChannelAddress = (appConfig: AppConfig | null | undefined) => (channelSlug: string) => {
  try {
    return appConfig?.shopConfigPerChannel[channelSlug].address ?? null;
  } catch (e) {
    return null;
  }
};

const setChannelAddress =
  (appConfig: AppConfig | null | undefined) =>
  (channelSlug: string) =>
  (address: SellerShopConfig["address"]) => {
    const appConfigNormalized = structuredClone(appConfig) ?? { shopConfigPerChannel: {} };

    appConfigNormalized.shopConfigPerChannel[channelSlug] ??= { address: getDefaultEmptyAddress() };
    appConfigNormalized.shopConfigPerChannel[channelSlug].address = address;

    return appConfigNormalized;
  };

export const AppConfigContainer = {
  getChannelAddress,
  setChannelAddress,
};
