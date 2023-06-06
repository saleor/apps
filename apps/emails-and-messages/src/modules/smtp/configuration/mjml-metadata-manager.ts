// TODO: MIGRATION CODE FROM CONFIG VERSION V1. REMOVE THIS FILE AFTER MIGRATION

import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { MjmlConfig } from "./migrations/mjml-config-schema-v1";

export class MjmlPrivateMetadataManager {
  private metadataKey = "mjml-config";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<MjmlConfig | undefined> {
    return this.metadataManager.get(this.metadataKey, this.saleorApiUrl).then((data) => {
      if (!data) {
        return data;
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid metadata value, can't be parsed");
      }
    });
  }

  setConfig(config: MjmlConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
