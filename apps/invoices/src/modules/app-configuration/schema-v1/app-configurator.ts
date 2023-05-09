import { AppConfigV1 } from "./app-config-v1";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

/**
 * @deprecated
 * Remove when SchemaV1 is migrated to SchemaV2
 */
export interface AppConfigurator {
  setConfig(config: AppConfigV1): Promise<void>;
  getConfig(): Promise<AppConfigV1 | undefined>;
}

/**
 * @deprecated
 * Remove when SchemaV1 is migrated to SchemaV2
 */
export class PrivateMetadataAppConfiguratorV1 implements AppConfigurator {
  private metadataKey = "app-config";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<AppConfigV1 | undefined> {
    return this.metadataManager.get(this.metadataKey, this.saleorApiUrl).then((data) => {
      if (!data) {
        return data;
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid metadata value, cant be parsed");
      }
    });
  }

  setConfig(config: AppConfigV1): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
