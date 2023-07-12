import { z } from "zod";
import { Contentful } from "../../providers/contentful/contentful";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const ContentfulProviderConfigSchemaInput = z.object({
  type: z.literal(Contentful.type),
  authToken: z.string(),
  spaceId: z.string(),
  environment: z.string(),
  configName: z.string(),
  contentId: z.string(),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
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
