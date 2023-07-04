import { z } from "zod";

export const StrapiConfigSchema = z.object({});
export type StrapiConfigSchemaType = z.infer<typeof StrapiConfigSchema>;

export class AppConfigV2 {
  private rootData: StrapiConfigSchemaType = {};

  constructor(initialData?: StrapiConfigSchemaType) {
    if (initialData) {
      this.rootData = StrapiConfigSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfigV2(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }
}
