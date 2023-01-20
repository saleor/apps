import { AddressFragment } from "../../../generated/graphql";

export interface SellerShopConfig {
  address: {
    companyName: string;
    cityArea: string;
    countryArea: string;
    streetAddress1: string;
    streetAddress2: string;
    postalCode: string;
    firstName: string;
    lastName: string;
    city: string;
    country: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
