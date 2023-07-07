import { z } from "zod";
import { Contentful } from "../../contentful/contentful";

const ContentfulProviderConfigSchemaInput = z.object({
  type: z.literal(Contentful.type),
  authToken: z.string(),
  spaceId: z.string(),
  environment: z.string(),
  configName: z.string(),
  contentId: z.string(),
  productVariantFieldsMapping: z.object({
    variantId: z.string().min(1),
    name: z.string().min(1),
    productId: z.string().min(1),
    productName: z.string().min(1),
    productSlug: z.string().min(1),
    channels: z.string().min(1),
  }),
});

const ContentfulProviderConfigSchema = ContentfulProviderConfigSchemaInput.extend({
  id: z.string(),
});

export type ContentfulProviderConfigInputType = z.infer<typeof ContentfulProviderConfigSchemaInput>;
export type ContentfulProviderConfigType = z.infer<typeof ContentfulProviderConfigSchema>;

export const ContentfulProviderSchema = {
  Config: ContentfulProviderConfigSchema,
  ConfigInput: ContentfulProviderConfigSchemaInput,
};
