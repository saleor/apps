import { SendgridConfig } from "./sendgrid-config-schema";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SendgridConfigV2 } from "./migrations/sendgrid-config-schema-v2";

export class SendgridPrivateMetadataManagerV2 {
  private metadataKey = "sendgrid-config-v2";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<SendgridConfigV2 | undefined> {
    return this.metadataManager.get(this.metadataKey, this.saleorApiUrl).then((data) => {
      if (!data) {
        return data;
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid metadata value, cant be parsed");
      }
    });
  }

  setConfig(config: SendgridConfigV2): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
