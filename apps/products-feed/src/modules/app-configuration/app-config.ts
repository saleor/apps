import { z } from "zod";
import { UrlConfiguration } from "./url-configuration";

export const s3BucketConfigurationSchema = z.object({
  bucketName: z.string().min(1),
  secretAccessKey: z.string().min(1),
  accessKeyId: z.string().min(1),
  region: z.string().min(1),
});

export type S3BucketConfiguration = z.infer<typeof s3BucketConfigurationSchema>;

export const urlConfigurationSchema = z.object({
  /**
   * min() to allow empty strings
   */
  storefrontUrl: z.string().min(0),
  productStorefrontUrl: z.string().min(0),
});

export type UrlConfiguration = z.infer<typeof urlConfigurationSchema>;

export const sellerShopConfigSchema = z.object({
  urlConfiguration: urlConfigurationSchema,
  s3BucketConfiguration: s3BucketConfigurationSchema.optional(),
});

export type SellerShopConfig = z.infer<typeof sellerShopConfigSchema>;

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
