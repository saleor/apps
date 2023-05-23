import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class CacheConfigurator {
  private metadataKeyPrefix = "cursor-cache-";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  get({ channel }: { channel: string }): Promise<string[] | undefined> {
    return this.metadataManager
      .get(this.metadataKeyPrefix + channel, this.saleorApiUrl)
      .then((data) => {
        if (!data) {
          return undefined;
        }

        try {
          return JSON.parse(data);
        } catch (e) {
          throw new Error("Invalid metadata value, can't be parsed");
        }
      });
  }

  set({ channel, value }: { channel: string; value: string[] }): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKeyPrefix + channel,
      value: JSON.stringify(value),
      domain: this.saleorApiUrl,
    });
  }
}
