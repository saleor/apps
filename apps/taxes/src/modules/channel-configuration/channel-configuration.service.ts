import { Client } from "urql";
import { ChannelFragment } from "../../../generated/graphql";
import { ChannelConfigProperties, ChannelsConfig } from "./channel-config";
import { ChannelConfigurationSettings } from "./channel-configuration-settings";
import { ChannelsFetcher } from "./channel-fetcher";

export class ChannelConfigurationService {
  private configurationService: ChannelConfigurationSettings;
  constructor(private client: Client, private saleorApiUrl: string) {
    this.configurationService = new ChannelConfigurationSettings(this.client, this.saleorApiUrl);
  }

  private mergeChannelsWithConfiguration(
    channels: ChannelFragment[],
    channelsConfig: ChannelsConfig
  ): ChannelsConfig {
    return channels.map((channel) => {
      const channelConfig = channelsConfig.find((c) => c.config.slug === channel.slug);

      return {
        id: channel.id,
        config: {
          providerInstanceId: channelConfig?.config.providerInstanceId ?? null,
          slug: channel.slug,
        },
      };
    });
  }
  async getAll() {
    const channelsFetcher = new ChannelsFetcher(this.client);
    const channels = await channelsFetcher.fetchChannels();

    const channelConfiguration = await this.configurationService.getAll();

    return this.mergeChannelsWithConfiguration(channels, channelConfiguration);
  }

  async update(id: string, data: ChannelConfigProperties) {
    await this.configurationService.upsert(id, data);
  }
}
