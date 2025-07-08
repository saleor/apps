import { AppChannelConfig } from "@/modules/app-config/domain/app-channel-config";

export class AppRootConfig {
  readonly chanelConfigMapping: Record<string, string>;
  readonly configsById: Record<string, AppChannelConfig>;

  constructor(
    chanelConfigMapping: Record<string, string>,
    configsById: Record<string, AppChannelConfig>,
  ) {
    this.chanelConfigMapping = chanelConfigMapping;
    this.configsById = configsById;
  }

  getAllConfigsAsList() {
    return Object.values(this.configsById);
  }

  getChannelsBoundToGivenConfig(configId: string) {
    const keyValues = Object.entries(this.chanelConfigMapping);
    const filtered = keyValues.filter(([_, value]) => value === configId);

    return filtered.map(([channelId]) => channelId);
  }
}
