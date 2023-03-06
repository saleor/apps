import { PrivateMetadataMjmlConfigurator } from "./mjml-configurator";
import { Client } from "urql";
import { logger as pinoLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app-configuration/metadata-manager";

// todo test
export class GetMjmlConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetMjmlConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedMjmlConfig = (await mjmlConfigurator.getConfig()) ?? null;

    logger.debug(savedMjmlConfig, "Retrieved MJML config from Metadata. Will return it");

    if (savedMjmlConfig) {
      return savedMjmlConfig;
    }
  }
}
