import { MjmlConfig } from "./mjml-config";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export interface MjmlConfigurator {
  setConfig(config: MjmlConfig): Promise<void>;
  getConfig(): Promise<MjmlConfig | undefined>;
}

export class PrivateMetadataMjmlConfigurator implements MjmlConfigurator {
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
