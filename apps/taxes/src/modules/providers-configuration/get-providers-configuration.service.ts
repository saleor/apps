import { Client } from "urql";
import { logger as pinoLogger } from "../../lib/logger";
import { createSettingsManager } from "../app-configuration/metadata-manager";
import { createDefaultConfig, serverProvidersSchema } from "./providers-config";
import { TaxProvidersConfigurator } from "./providers-configurator";

export class GetProvidersConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetProvidersConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const taxConfigurator = new TaxProvidersConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedProvidersConfig = (await taxConfigurator.getConfig()) ?? null;
    const validation = serverProvidersSchema.safeParse(savedProvidersConfig);

    logger.info({ validation }, "Config validated:");

    if (validation.success) {
      logger.info("App config is valid. Returning.");
      return validation.data;
    }

    logger.info("App config not found in metadata. Will return default config.");
    const defaultConfig = createDefaultConfig();

    return defaultConfig;
  }
}
