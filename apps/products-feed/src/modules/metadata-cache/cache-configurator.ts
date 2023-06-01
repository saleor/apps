import { SettingsManager } from "@saleor/app-sdk/settings-manager";

export class CacheConfigurator {
  private metadataKeyPrefix = "cursor-cache-";

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  private constructKey(channel: string) {
    return this.metadataKeyPrefix + channel;
  }

  get({ channel }: { channel: string }): Promise<string[] | undefined> {
    return this.metadataManager.get(this.constructKey(channel), this.saleorApiUrl).then((data) => {
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
      key: this.constructKey(channel),
      value: JSON.stringify(value),
      domain: this.saleorApiUrl,
    });
  }
}
