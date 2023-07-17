import { z } from "zod";

/**
 * TODO Consider optional fields
 */
export const SaleorProviderFieldsMappingSchema = z.object({
  variantId: z.string().min(1),
  variantName: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  channels: z.string().min(1),
});

export type SaleorProviderFieldsMappingType = z.infer<typeof SaleorProviderFieldsMappingSchema>;
export type SaleorProviderFieldsMappingKey = keyof SaleorProviderFieldsMappingType;

export const SaleorProviderFieldsMappingKeys: Array<SaleorProviderFieldsMappingKey> = [
  "variantId",
  "variantName",
  "productId",
  "productName",
  "productSlug",
  "channels",
];
