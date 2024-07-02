import { z } from "zod";
import { TypesenseRootFieldsKeys } from "../../lib/typesense-fields";

export const AppConfigurationSchema = z.object({
  host: z.string(),
  protocol: z.string(),
  apiKey: z.string(),
  port: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  connectionTimeoutSeconds: z.union([z.string(), z.number()]).transform((val) => Number(val)),
});

export const FieldsConfigSchema = z.object({
  enabledTypesenseFields: z.array(z.string()),
});

const AppConfigRootSchema = z.object({
  appConfig: AppConfigurationSchema.nullable(),
  fieldsMapping: FieldsConfigSchema,
});

export type AppConfigurationFields = z.infer<typeof AppConfigurationSchema>;
export type AppConfigRootSchemaFields = z.infer<typeof AppConfigRootSchema>;

export class AppConfig {
  private rootData: AppConfigRootSchemaFields = {
    appConfig: null,
    fieldsMapping: {
      enabledTypesenseFields: [...TypesenseRootFieldsKeys],
    },
  };

  constructor(initialData?: AppConfigRootSchemaFields) {
    if (initialData) {
      this.rootData = AppConfigRootSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  setTypesenseSettings(settings: AppConfigurationFields) {
    this.rootData.appConfig = AppConfigurationSchema.parse(settings);

    return this;
  }

  setFieldsMapping(fieldsMapping: string[]) {
    this.rootData.fieldsMapping = {
      enabledTypesenseFields: z.array(z.string()).parse(fieldsMapping),
    };

    return this;
  }

  getConfig() {
    return this.rootData;
  }
}
