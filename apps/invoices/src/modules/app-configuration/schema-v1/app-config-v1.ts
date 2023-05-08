import { SellerAddress } from "../address";

export interface SellerShopConfig {
  address: SellerAddress;
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfigV1 = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
