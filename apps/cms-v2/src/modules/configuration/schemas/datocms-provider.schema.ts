import { Datocms } from "@/modules/providers/datocms/datocms";
import { z } from "zod";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const InputSchema = z.object({
  type: z.literal(Datocms.type),
  authToken: z.string().min(1),
  configName: z.string().min(1),
  itemType: z.string().min(1),
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
