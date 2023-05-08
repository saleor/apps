import { PrivateMetadataAppConfiguratorV1 } from "../schema-v1/app-configurator";
import { createSettingsManager, SimpleGraphqlClient } from "../metadata-manager";
import { AppConfigV2 } from "./app-config";
import { ConfigV1ToV2Transformer } from "./config-v1-to-v2-transformer";
import { AppConfigV2MetadataManager } from "./app-config-v2-metadata-manager";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class ConfigV1ToV2MigrationService {
  settingsManager: SettingsManager;
  configMetadataManager: AppConfigV2MetadataManager;
  metadataV1AppConfigurator: PrivateMetadataAppConfiguratorV1;

  constructor(private client: SimpleGraphqlClient, private saleorApiUrl: string) {
    this.settingsManager = createSettingsManager(client);
    this.configMetadataManager = new AppConfigV2MetadataManager(this.settingsManager);
    this.metadataV1AppConfigurator = new PrivateMetadataAppConfiguratorV1(
      this.settingsManager,
      this.saleorApiUrl
    );
  }

  async migrate(beforeSave?: (config: AppConfigV2) => void): Promise<AppConfigV2> {
    const v1Config = await this.metadataV1AppConfigurator.getConfig();

    /**
     * If no v1 config, it means clean install - return pure config
     */
    if (!v1Config) {
      const pureConfig = new AppConfigV2();

      if (beforeSave) {
        beforeSave(pureConfig);
      }

      await this.configMetadataManager.set(pureConfig.serialize());

      return pureConfig;
    }

    /**
     * Otherwise, transform v1 config to v2 and save it
     */
    const transformer = new ConfigV1ToV2Transformer();
    const appConfigV2FromV1 = transformer.transform(v1Config);

    if (beforeSave) {
      beforeSave(appConfigV2FromV1);
    }

    await this.configMetadataManager.set(appConfigV2FromV1.serialize());

    return appConfigV2FromV1;
  }
}
