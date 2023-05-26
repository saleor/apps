import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "../../lib/metadata-manager";
import { ChannelsFetcher } from "../channels/channels-fetcher";
import { FallbackAppConfig } from "./fallback-app-config";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";

/**
 * @deprecated
 */
export class GetAppConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = createLogger({
      service: "GetAppConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const appConfigurator = new PrivateMetadataAppConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedAppConfig = (await appConfigurator.getConfig()) ?? null;

    logger.debug(savedAppConfig, "Retrieved app config from Metadata. Will return it");

    if (savedAppConfig) {
      return savedAppConfig;
    }

    logger.info("App config not found in metadata. Will create default config now.");

    const channelsFetcher = new ChannelsFetcher(apiClient);

    const channels = await channelsFetcher.fetchChannels();

    logger.debug(channels, "Fetched channels");

    const appConfig = FallbackAppConfig.createFallbackConfigFromExistingShopAndChannels(
      channels ?? []
    );

    logger.debug(appConfig, "Created a fallback AppConfig. Will save it.");

    await appConfigurator.setConfig(appConfig);

    logger.info("Saved initial AppConfig");

    return appConfig;
  }
}
