import { MjmlConfigurator, PrivateMetadataMjmlConfigurator } from "./mjml-configurator";
import { Client } from "urql";
import { logger as pinoLogger } from "../../../lib/logger";
import { MjmlConfig, MjmlConfiguration } from "./mjml-config";
import { FilterConfigurationsArgs, MjmlConfigContainer } from "./mjml-config-container";
import { createSettingsManager } from "../../../lib/metadata-manager";

const logger = pinoLogger.child({
  service: "MjmlConfigurationService",
});

export class MjmlConfigurationService {
  private configurationData?: MjmlConfig;
  private metadataConfigurator: MjmlConfigurator;

  constructor(args: { apiClient: Client; saleorApiUrl: string; initialData?: MjmlConfig }) {
    this.metadataConfigurator = new PrivateMetadataMjmlConfigurator(
      createSettingsManager(args.apiClient),
      args.saleorApiUrl
    );

    if (args.initialData) {
      this.configurationData = args.initialData;
    }
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

  // Returns configuration from cache or fetches it from Saleor API
  async getConfigurationRoot() {
    logger.debug("Get configuration root");

    if (this.configurationData) {
      logger.debug("Using cached configuration");
      return this.configurationData;
    }

    // No cached data, fetch it from Saleor API
    await this.pullConfiguration();

    if (!this.configurationData) {
      logger.warn("No configuration found in Saleor API");
      return;
    }

    return this.configurationData;
  }

  // Saves configuration to Saleor API and cache it
  async setConfigurationRoot(config: MjmlConfig) {
    logger.debug("Set configuration root");

    this.configurationData = config;
    await this.pushConfiguration();
  }

  async getConfiguration({ id }: { id: string }) {
    logger.debug("Get configuration");
    return MjmlConfigContainer.getConfiguration(await this.getConfigurationRoot())({ id });
  }

  async getConfigurations(filter?: FilterConfigurationsArgs) {
    logger.debug("Get configuration");
    return MjmlConfigContainer.getConfigurations(await this.getConfigurationRoot())(filter);
  }

  async createConfiguration(config: Omit<MjmlConfiguration, "id" | "events">) {
    logger.debug("Create configuration");
    const updatedConfigurationRoot = MjmlConfigContainer.createConfiguration(
      await this.getConfigurationRoot()
    )(config);
    await this.setConfigurationRoot(updatedConfigurationRoot);

    return updatedConfigurationRoot.configurations[
      updatedConfigurationRoot.configurations.length - 1
    ];
  }

  async updateConfiguration(config: MjmlConfiguration) {
    logger.debug("Update configuration");
    const updatedConfigurationRoot = MjmlConfigContainer.updateConfiguration(
      await this.getConfigurationRoot()
    )(config);
    this.setConfigurationRoot(updatedConfigurationRoot);
  }

  async deleteConfiguration({ id }: { id: string }) {
    logger.debug("Delete configuration");
    const updatedConfigurationRoot = MjmlConfigContainer.deleteConfiguration(
      await this.getConfigurationRoot()
    )({ id });
    this.setConfigurationRoot(updatedConfigurationRoot);
  }
}
