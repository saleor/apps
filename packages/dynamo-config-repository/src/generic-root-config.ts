export class GenericRootConfig<ChannelConfig> {
  readonly chanelConfigMapping: Record<string, string>;
  readonly configsById: Record<string, ChannelConfig>;

  constructor({
    chanelConfigMapping,
    configsById,
  }: {
    chanelConfigMapping: Record<string, string>;
    configsById: Record<string, ChannelConfig>;
  }) {
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

  getConfigByChannelId(channelId: string) {
    return this.configsById[this.chanelConfigMapping[channelId]];
  }

  getConfigById(configId: string) {
    return this.configsById[configId];
  }
}
