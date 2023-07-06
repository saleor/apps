import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { ChannelProviderConnectionConfig } from "./channel-provider-connection-config";

export class ChannelProviderConnectionSettingsManager {
  private readonly metadataKey = "channel-provider-connection-v1";

  constructor(private settingsManager: SettingsManager) {}

  get(): Promise<ChannelProviderConnectionConfig> {
    return this.settingsManager.get(this.metadataKey).then((data) => {
      return data
        ? ChannelProviderConnectionConfig.parse(data)
        : new ChannelProviderConnectionConfig();
    });
  }

  set(config: ChannelProviderConnectionConfig) {
    return this.settingsManager.set({
      key: this.metadataKey,
      value: config.serialize(),
    });
  }
}
