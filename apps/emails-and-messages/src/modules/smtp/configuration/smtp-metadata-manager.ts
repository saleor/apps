import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpConfig } from "./smtp-config-schema";

export class SmtpPrivateMetadataManager {
  private metadataKey = "smtp-config";

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
