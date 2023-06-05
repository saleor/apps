import { Client } from "urql";
import { createLogger } from "../../lib/logger";
import { createSettingsManager } from "../app/metadata-manager";
import { TaxChannelsConfigurator } from "./channel-configurator";

export class GetChannelsConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = createLogger({
      service: "GetChannelsConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const taxConfigurator = new TaxChannelsConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const appChannelsConfig = (await taxConfigurator.getConfig()) ?? null;

    logger.debug(appChannelsConfig, "Retrieved channels config from Metadata");

    return { ...appChannelsConfig };
  }
}
