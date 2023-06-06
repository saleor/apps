// TODO: MIGRATION CODE FROM CONFIG VERSION V1. REMOVE THIS FILE AFTER MIGRATION

import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { AppConfig } from "./app-config-schema";

export class AppConfigPrivateMetadataManager {
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
