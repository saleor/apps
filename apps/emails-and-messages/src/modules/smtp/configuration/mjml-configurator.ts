import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpConfig } from "./mjml-config-schema";

export interface MjmlConfigurator {
  setConfig(config: SmtpConfig): Promise<void>;
  getConfig(): Promise<SmtpConfig | undefined>;
}

export class PrivateMetadataMjmlConfigurator implements MjmlConfigurator {
  private metadataKey = "mjml-config";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<SmtpConfig | undefined> {
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

  setConfig(config: SmtpConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
