import { Client } from "urql";
import { ChannelConfigProperties } from "./channel-config";
import { ChannelConfigurationSettings } from "./channel-configuration-settings";
import { ChannelsFetcher } from "./channel-fetcher";
import { ChannelConfigurationMerger } from "./channel-configuration-merger";

export class ChannelConfigurationService {
  private configurationService: ChannelConfigurationSettings;
  constructor(private client: Client, private appId: string, private saleorApiUrl: string) {
    this.configurationService = new ChannelConfigurationSettings(client, appId, saleorApiUrl);
  }

  async getAll() {
    const channelsFetcher = new ChannelsFetcher(this.client);
    const channels = await channelsFetcher.fetchChannels();

    const channelConfiguration = await this.configurationService.getAll();

    const configurationMerger = new ChannelConfigurationMerger();

    return configurationMerger.merge(channels, channelConfiguration);
  }

  async update(id: string, data: ChannelConfigProperties) {
    await this.configurationService.upsert(id, data);
  }
}
