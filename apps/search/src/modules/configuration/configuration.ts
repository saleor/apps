import { z } from "zod";
import { AlgoliaRootFieldsKeys } from "../../lib/algolia-fields";

export const AppConfigurationSchema = z.object({
  appId: z.string().min(3),
  indexNamePrefix: z.string().optional(),
  secretKey: z.string().min(3),
});

export const FieldsConfigSchema = z.object({
  enabledAlgoliaFields: z.array(z.string()),
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
      enabledAlgoliaFields: [...AlgoliaRootFieldsKeys],
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

  setAlgoliaSettings(settings: AppConfigurationFields) {
    this.rootData.appConfig = AppConfigurationSchema.parse(settings);

    return this;
  }

  setFieldsMapping(fieldsMapping: string[]) {
    this.rootData.fieldsMapping = {
      enabledAlgoliaFields: z.array(z.string()).parse(fieldsMapping),
    };

    return this;
  }

  getConfig() {
    return this.rootData;
  }
}
