import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { Client } from "urql";
import { logger as pinoLogger } from "../../lib/logger";
import { AppConfig, AppConfigurationPerChannel } from "./app-config";
import { getDefaultEmptyAppConfiguration } from "./app-config-container";
import { createSettingsManager } from "../../lib/metadata-manager";

const logger = pinoLogger.child({
  service: "AppConfigurationService",
});

export class AppConfigurationService {
  private configurationData?: AppConfig;
  private metadataConfigurator: PrivateMetadataAppConfigurator;

  constructor(args: { apiClient: Client; saleorApiUrl: string; initialData?: AppConfig }) {
    this.metadataConfigurator = new PrivateMetadataAppConfigurator(
      createSettingsManager(args.apiClient),
      args.saleorApiUrl
    );
  }

  // Fetch configuration from Saleor API and cache it
  private async pullConfiguration() {
    logger.debug("Fetch configuration from Saleor API");

    const config = await this.metadataConfigurator.getConfig();
    this.configurationData = config;
  }

  // Push configuration to Saleor API
  private async pushConfiguration() {
    logger.debug("Push configuration to Saleor API");

    await this.metadataConfigurator.setConfig(this.configurationData!);
  }

  async getConfiguration() {
    logger.debug("Get configuration");

    if (!this.configurationData) {
      logger.debug("No configuration found in cache. Will fetch it from Saleor API");
      await this.pullConfiguration();
    }

    const savedAppConfig = this.configurationData ?? null;

    logger.debug(savedAppConfig, "Retrieved app config from Metadata. Will return it");

    if (savedAppConfig) {
      return savedAppConfig;
    }
  }

  // Saves configuration to Saleor API and cache it
  async setConfigurationRoot(config: AppConfig) {
    logger.debug("Set configuration");

    this.configurationData = config;
    await this.pushConfiguration();
  }

  // Returns channel configuration if existing. Otherwise returns default empty one
  async getChannelConfiguration(channel: string) {
    logger.debug("Get channel configuration");
    const configurations = await this.getConfiguration();
    if (!configurations) {
      return getDefaultEmptyAppConfiguration();
    }

    const channelConfiguration = configurations.configurationsPerChannel[channel];
    return channelConfiguration || getDefaultEmptyAppConfiguration();
  }

  async setChannelConfiguration({
    channel,
    configuration,
  }: {
    channel: string;
    configuration: AppConfigurationPerChannel;
  }) {
    logger.debug("Set channel configuration");
    let configurations = await this.getConfiguration();
    if (!configurations) {
      configurations = { configurationsPerChannel: {} };
    }

    configurations.configurationsPerChannel[channel] = configuration;
    await this.setConfigurationRoot(configurations);
  }
}
