import { PrivateMetadataSendgridConfigurator } from "./sendgrid-configurator";
import { Client } from "urql";
import { logger as pinoLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app-configuration/metadata-manager";

// todo test
export class GetSendgridConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetSendgridConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const sendgridConfigurator = new PrivateMetadataSendgridConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedSendgridConfig = (await sendgridConfigurator.getConfig()) ?? null;

    logger.debug(savedSendgridConfig, "Retrieved sendgrid config from Metadata. Will return it");

    if (savedSendgridConfig) {
      return savedSendgridConfig;
    }
  }
}
