import { SellerAddress } from "./address";

export interface SellerShopConfig {
  address: SellerAddress;
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
