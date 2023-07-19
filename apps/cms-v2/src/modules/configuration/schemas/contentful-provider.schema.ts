import { z } from "zod";
import { Contentful } from "../../providers/contentful/contentful";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const InputSchema = z.object({
  type: z.literal(Contentful.type),
  authToken: z.string().min(1),
  spaceId: z.string().min(1),
  environment: z.string().min(1),
  configName: z.string().min(1),
  contentId: z.string().min(1),
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
