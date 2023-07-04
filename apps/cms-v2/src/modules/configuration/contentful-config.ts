import { z } from "zod";

export const ContentfulConfigSchema = z.object({
  productVariantFieldsMapping: z
    .object({
      variantId: z.string().min(1),
      name: z.string().min(1),
      productId: z.string().min(1),
      productName: z.string().min(1),
      productSlug: z.string().min(1),
      channels: z.string().min(1),
    })
    .nullable(),
});
export type ContentfulConfigSchemaType = z.infer<typeof ContentfulConfigSchema>;

export class AppConfigV2 {
  private rootData: ContentfulConfigSchemaType = {
    productVariantFieldsMapping: null,
  };

  constructor(initialData?: ContentfulConfigSchemaType) {
    if (initialData) {
      this.rootData = ContentfulConfigSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfigV2(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }
}
