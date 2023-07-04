import { z } from "zod";

export const ContentfulConfigSchema = z.object({});
export type ContentfulConfigSchemaType = z.infer<typeof ContentfulConfigSchema>;

export class AppConfigV2 {
  private rootData: ContentfulConfigSchemaType = {};

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
