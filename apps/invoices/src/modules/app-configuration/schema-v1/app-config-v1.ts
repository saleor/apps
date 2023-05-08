import { SellerAddress } from "../address";

/**
 * @deprecated
 * Remove when SchemaV1 is migrated to SchemaV2
 */
export interface SellerShopConfig {
  address: SellerAddress;
}

/**
 * @deprecated
 * Remove when SchemaV1 is migrated to SchemaV2
 */
export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

/**
 * @deprecated
 * Remove when SchemaV1 is migrated to SchemaV2
 */
export type AppConfigV1 = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
