import { PayloadCMS } from "@/modules/providers/payloadcms/payloadcms";
import { z } from "zod";
import { SaleorProviderFieldsMappingSchema } from "./saleor-provider-fields-mapping.schema";

const InputSchema = z.object({
  type: z.literal(PayloadCMS.type),
  authToken: z.string(),
  configName: z.string().min(1),
  collectionName: z.string().min(1),
  productVariantFieldsMapping: SaleorProviderFieldsMappingSchema,
  payloadApiUrl: z.string().url(),
  authenticatedUserSlug: z.string(),
});

const FullSchema = InputSchema.extend({
  id: z.string(),
});

export namespace PayloadCmsProviderConfig {
  export type InputShape = z.infer<typeof InputSchema>;
  export type FullShape = z.infer<typeof FullSchema>;

  export const Schema = {
    Input: InputSchema,
    Full: FullSchema,
  };
}
