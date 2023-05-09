import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class AppConfigV2MetadataManager {
  public readonly metadataKey = "app-config-v2";

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
