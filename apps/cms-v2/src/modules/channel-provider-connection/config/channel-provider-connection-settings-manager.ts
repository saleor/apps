import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { ContentfulConfig } from "./contentful-config";

export class ContentfulSettingsManager {
  private readonly metadataKey = "contentful-config-v1";

  constructor(private settingsManager: SettingsManager) {}

  get(): Promise<ContentfulConfig> {
    return this.settingsManager.get(this.metadataKey).then((data) => {
      return data ? ContentfulConfig.parse(data) : new ContentfulConfig();
    });
  }

  set(config: ContentfulConfig) {
    return this.settingsManager.set({
      key: this.metadataKey,
      value: config.serialize(),
    });
  }
}
