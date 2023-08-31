import { z } from "zod";
import { AlgoliaRootFieldsKeys } from "../../lib/algolia-fields";

export const AppConfigurationSchema = z.object({
  appId: z.string().min(3),
  indexNamePrefix: z.string().optional(),
  secretKey: z.string().min(3),
  enabledAlgoliaFields: z.array(z.string()).default(AlgoliaRootFieldsKeys),
});

export type AppConfigurationFields = z.infer<typeof AppConfigurationSchema>;

export const AppConfigRootSchema = AppConfigurationSchema.nullable();
export type AppConfigRootSchemaFields = z.infer<typeof AppConfigRootSchema>;

export class AppConfig {
  private rootData: AppConfigRootSchemaFields = null;

  constructor(initialData?: AppConfigRootSchemaFields) {
    if (initialData) {
      this.rootData = AppConfigurationSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  setAlgoliaSettings(settings: AppConfigurationFields) {
    this.rootData = AppConfigurationSchema.parse(settings);

    return this;
  }

  getConfig() {
    return this.rootData;
  }
}
