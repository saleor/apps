import { z } from "zod";

export const DatoCMSConfigSchema = z.object({});
export type DatoCMSConfigSchemaType = z.infer<typeof DatoCMSConfigSchema>;

export class AppConfigV2 {
  private rootData: DatoCMSConfigSchemaType = {};

  constructor(initialData?: DatoCMSConfigSchemaType) {
    if (initialData) {
      this.rootData = DatoCMSConfigSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfigV2(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }
}
