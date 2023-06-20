import { Client } from "urql";
import { ChannelConfigProperties } from "./channel-config";
import { ChannelConfigurationRepository } from "./channel-configuration-repository";
import { ChannelsFetcher } from "./channel-fetcher";
import { ChannelConfigurationMerger } from "./channel-configuration-merger";
import { TaxChannelsV1toV2MigrationManager } from "../../../scripts/migrations/tax-channels-migration-v1-to-v2";
import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../lib/logger";
import { createSettingsManager } from "../app/metadata-manager";

export class ChannelConfigurationService {
  private configurationRepository: ChannelConfigurationRepository;
  private logger: Logger;
  private settingsManager: EncryptedMetadataManager;
  constructor(private client: Client, private appId: string, private saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client, appId);

    this.settingsManager = settingsManager;

    this.logger = createLogger({
      name: "ChannelConfigurationService",
    });

    this.configurationRepository = new ChannelConfigurationRepository(
      settingsManager,
      saleorApiUrl
    );
  }

  async getAll() {
    const channelsFetcher = new ChannelsFetcher(this.client);

    const migrationManager = new TaxChannelsV1toV2MigrationManager(
      this.settingsManager,
      this.saleorApiUrl
    );

    const migratedConfig = await migrationManager.migrateIfNeeded();

    if (migratedConfig) {
      this.logger.info("Config migrated", migratedConfig);
      return migratedConfig;
    }

    this.logger.info("Config is up to date, no need to migrate.");
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
