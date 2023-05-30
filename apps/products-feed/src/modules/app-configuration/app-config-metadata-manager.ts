import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class AppConfigMetadataManager {
  private readonly metadataKey = "app-config-v1";

  constructor(private settingsManager: SettingsManager) {}

  get() {
    return this.settingsManager.get(this.metadataKey);
  }

  set(stringMetadata: string) {
    return this.settingsManager.set({
      key: this.metadataKey,
      value: stringMetadata,
    });
  }
}
