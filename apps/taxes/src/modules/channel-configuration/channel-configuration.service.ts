import { Client } from "urql";
import { ChannelsFetcher } from "./channel-fetcher";
import { ChannelConfig, ChannelsConfig } from "./channel-config";
import { ChannelFragment } from "../../../generated/graphql";
import { ChannelConfigurationSettings } from "./channel-configuration-settings";

export class ChannelConfigurationService {
  private configurationService: ChannelConfigurationSettings;
  constructor(private client: Client, private saleorApiUrl: string) {
    this.configurationService = new ChannelConfigurationSettings(this.client, this.saleorApiUrl);
  }

  private mergeChannelsWithConfiguration(
    channels: ChannelFragment[],
    config: ChannelsConfig
  ): ChannelsConfig {
    return channels.reduce((acc, channel) => {
      const channelSlug = channel.slug;
      const channelConfig = config.find((c) => c.slug === channelSlug);

      return {
        ...acc,
        [channel.slug]: {
          providerInstanceId: channelConfig?.providerInstanceId ?? null,
        },
      };
    }, {} as ChannelsConfig);
  }
  async getAll() {
    const channelsFetcher = new ChannelsFetcher(this.client);
    const channels = await channelsFetcher.fetchChannels();

    const channelConfiguration = await this.configurationService.getAll();

    return this.mergeChannelsWithConfiguration(channels, channelConfiguration);
  }

  async update(slug: string, data: ChannelConfig) {
    await this.configurationService.update(slug, data);
  }
}
