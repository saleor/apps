import { Datocms } from "@/modules/datocms/datocms";
import { z } from "zod";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const DatocmsProviderConfigSchemaInput = z.object({
  type: z.literal(Datocms.type),
  authToken: z.string(),
  configName: z.string(),
  itemType: z.string(),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
});

const DatocmsProviderConfigSchema = DatocmsProviderConfigSchemaInput.extend({
  id: z.string(),
});

export type DatocmsProviderConfigInputType = z.infer<typeof DatocmsProviderConfigSchemaInput>;
export type DatocmsProviderConfigType = z.infer<typeof DatocmsProviderConfigSchema>;

export const DatocmsProviderSchema = {
  Config: DatocmsProviderConfigSchema,
  ConfigInput: DatocmsProviderConfigSchemaInput,
};
