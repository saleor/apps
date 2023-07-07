import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { AppConfig } from "./app-config";

export class AppConfigMetadataManager {
  public readonly metadataKey = "app-config-v1";

  constructor(private mm: SettingsManager) {}

  async get() {
    const metadata = await this.mm.get(this.metadataKey);

    return metadata ? AppConfig.parse(metadata) : new AppConfig();
  }

  set(config: AppConfig) {
    return this.mm.set({
      key: this.metadataKey,
      value: config.serialize(),
    });
  }
}
