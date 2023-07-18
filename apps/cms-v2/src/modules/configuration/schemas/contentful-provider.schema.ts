import { z } from "zod";
import { Contentful } from "../../providers/contentful/contentful";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const InputSchema = z.object({
  type: z.literal(Contentful.type),
  authToken: z.string(),
  spaceId: z.string(),
  environment: z.string(),
  configName: z.string(),
  contentId: z.string(),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
});

const FullSchema = InputSchema.extend({
  id: z.string(),
});

export namespace ContentfulProviderConfig {
  export type InputShape = z.infer<typeof InputSchema>;
  export type FullShape = z.infer<typeof FullSchema>;

  export const Schema = {
    Input: InputSchema,
    Full: FullSchema,
  };
}
