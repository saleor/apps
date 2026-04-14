import { type SettingsManager } from "@saleor/app-sdk/settings-manager";

import { ENCRYPTED_METADATA_KEYS } from "../../lib/encrypted-metadata-keys";

export class AppConfigMetadataManager {
  private readonly metadataKey = ENCRYPTED_METADATA_KEYS.APP_CONFIG;

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
