export interface SellerShopConfig {
  urlConfiguration: {
    storefrontUrl: string;
    productStorefrontUrl: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
