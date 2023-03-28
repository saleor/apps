import { Client } from "urql";
import { logger as pinoLogger } from "../../lib/logger";
import { createSettingsManager } from "../app-configuration/metadata-manager";
import { ChannelsFetcher } from "../channels/channels-fetcher";
import { createDefaultChannelsConfig } from "./channels-config";
import { TaxChannelsConfigurator } from "./channels-configurator";

export class GetChannelsConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetChannelsConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const taxConfigurator = new TaxChannelsConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const channelsFetcher = new ChannelsFetcher(apiClient);
    const channels = await channelsFetcher.fetchChannels();
    logger.debug({ channels }, "Fetched Saleor channels that use TAX_APP for tax calculation");
    const defaultConfig = createDefaultChannelsConfig(channels ?? []);
    logger.debug({ defaultConfig }, "Generated config from Saleor channels");

    // todo: validate config
    const appChannelsConfig = (await taxConfigurator.getConfig()) ?? null;

    logger.debug(appChannelsConfig, "Retrieved channels config from Metadata");

    return { ...defaultConfig, ...appChannelsConfig };
  }
}
