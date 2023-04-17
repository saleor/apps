import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export interface AppConfigurator<TConfig extends Record<string, any>> {
  setConfig(config: TConfig): Promise<void>;
  getConfig(): Promise<TConfig | undefined>;
}

export class PrivateMetadataAppConfigurator<TConfig extends Record<string, any>>
  implements AppConfigurator<TConfig>
{
  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private metadataKey: string
  ) {
    this.metadataKey = metadataKey;
  }

  getConfig(): Promise<TConfig | undefined> {
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

  setConfig(config: TConfig): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
