import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class AppConfigMetadataManager {
  private readonly metadataKey = "app-config-v1";

  constructor(private mm: SettingsManager) {}

  get() {
    return this.mm.get(this.metadataKey);
  }

  set(stringMetadata: string) {
    return this.mm.set({
      key: this.metadataKey,
      value: stringMetadata,
    });
  }
}
