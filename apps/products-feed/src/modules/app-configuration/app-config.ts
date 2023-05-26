import { z } from "zod";

/**
 * @deprecated
 */
export const s3BucketConfigurationSchema = z.object({
  bucketName: z.string().min(1),
  secretAccessKey: z.string().min(1),
  accessKeyId: z.string().min(1),
  region: z.string().min(1),
});

/**
 * @deprecated
 */
export type S3BucketConfiguration = z.infer<typeof s3BucketConfigurationSchema>;

/**
 * @deprecated
 */
export const urlConfigurationSchema = z.object({
  /**
   * min() to allow empty strings
   */
  storefrontUrl: z.string().min(0),
  productStorefrontUrl: z.string().min(0),
});

/**
 * @deprecated
 */
export const sellerShopConfigSchema = z.object({
  urlConfiguration: urlConfigurationSchema,
  s3BucketConfiguration: s3BucketConfigurationSchema.optional(),
});

/**
 * @deprecated
 */
export type SellerShopConfig = z.infer<typeof sellerShopConfigSchema>;

/**
 * @deprecated
 */
export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

/**
 * @deprecated
 */
export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
