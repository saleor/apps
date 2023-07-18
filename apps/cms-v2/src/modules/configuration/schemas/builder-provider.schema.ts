import { z } from "zod";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";
import { BuilderIo } from "@/modules/providers/builder.io/builder-io";

const InputSchema = z.object({
  type: z.literal(BuilderIo.type),
  privateApiKey: z.string().min(1),
  publicApiKey: z.string().min(1),
  configName: z.string().min(1),
  modelName: z.string().min(1),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
});

const FullSchema = InputSchema.extend({
  id: z.string(),
});

export namespace BuilderIoProviderConfig {
  export type InputShape = z.infer<typeof InputSchema>;
  export type FullShape = z.infer<typeof FullSchema>;

  export const Schema = {
    Input: InputSchema,
    Full: FullSchema,
  };
}
