import { ChannelConfigProperties } from "./channel-config";
import { ChannelConfigurationMerger } from "./channel-configuration-merger";
import { ChannelConfigurationRepository } from "./channel-configuration-repository";
import { ChannelsFetcher } from "./channel-fetcher";

export class ChannelConfigurationService {
  constructor(
    private configurationRepository: ChannelConfigurationRepository,
    private channelsFetcher: ChannelsFetcher,
  ) {}

  async getAll() {
    const channels = await this.channelsFetcher.fetchChannels();

    const channelConfiguration = await this.configurationRepository.getAll();

    const configurationMerger = new ChannelConfigurationMerger();

    return configurationMerger.merge(channels, channelConfiguration);
  }

  async upsert(data: ChannelConfigProperties) {
    const { slug } = data;
    const configurations = await this.configurationRepository.getAll();

    const existingConfiguration = configurations.find((c) => c.config.slug === slug);

    if (existingConfiguration) {
      return this.configurationRepository.updateById(existingConfiguration.id, { config: data });
    }

    return this.configurationRepository.create({ config: data });
  }
}
