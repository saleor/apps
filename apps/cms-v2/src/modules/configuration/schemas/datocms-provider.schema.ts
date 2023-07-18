import { Datocms } from "@/modules/providers/datocms/datocms";
import { z } from "zod";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const InputSchema = z.object({
  type: z.literal(Datocms.type),
  authToken: z.string(),
  configName: z.string(),
  itemType: z.string(),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
});

const FullSchema = InputSchema.extend({
  id: z.string(),
});

export namespace DatocmsProviderConfig {
  export type InputShape = z.infer<typeof InputSchema>;
  export type FullShape = z.infer<typeof FullSchema>;

  export const Schema = {
    Input: InputSchema,
    Full: FullSchema,
  };
}
