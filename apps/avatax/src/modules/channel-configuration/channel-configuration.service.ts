import { Client } from "urql";
import { ChannelConfigProperties } from "./channel-config";
import { ChannelConfigurationRepository } from "./channel-configuration-repository";
import { ChannelsFetcher } from "./channel-fetcher";
import { ChannelConfigurationMerger } from "./channel-configuration-merger";
import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { createSettingsManager } from "../app/metadata-manager";
import { createLogger } from "../../logger";
import { metadataCache } from "../../lib/app-metadata-cache";

export class ChannelConfigurationService {
  private configurationRepository: ChannelConfigurationRepository;
  private logger = createLogger("ChannelConfigurationService");
  private settingsManager: EncryptedMetadataManager;
  constructor(
    private client: Client,
    private appId: string,
    private saleorApiUrl: string,
  ) {
    const settingsManager = createSettingsManager(client, appId, metadataCache);

    this.settingsManager = settingsManager;

    this.configurationRepository = new ChannelConfigurationRepository(
      settingsManager,
      saleorApiUrl,
    );
  }

  async getAll() {
    const channelsFetcher = new ChannelsFetcher(this.client);

    const channels = await channelsFetcher.fetchChannels();

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
