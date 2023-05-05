import { AppConfig } from "./app-config";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export interface AppConfigurator {
  setConfig(config: AppConfig): Promise<void>;
  getConfig(): Promise<AppConfig | undefined>;
}

export class PrivateMetadataAppConfigurator implements AppConfigurator {
  private metadataKey = "app-config";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<AppConfig | undefined> {
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

  setConfig(config: AppConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
