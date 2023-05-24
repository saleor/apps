import { SmtpConfigurator, PrivateMetadataSmtpConfigurator } from "./smtp-configurator";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import { FilterConfigurationsArgs, SmtpConfigContainer } from "./smtp-config-container";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { SmtpConfig, SmtpConfiguration } from "./smtp-config-schema";

const logger = createLogger({
  service: "SmtpConfigurationService",
});

export class SmtpConfigurationService {
  private configurationData?: SmtpConfig;
  private metadataConfigurator: SmtpConfigurator;

  constructor(args: { apiClient: Client; saleorApiUrl: string; initialData?: SmtpConfig }) {
    this.metadataConfigurator = new PrivateMetadataSmtpConfigurator(
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
  async setConfigurationRoot(config: SmtpConfig) {
    logger.debug("Set configuration root");

    this.configurationData = config;
    await this.pushConfiguration();
  }

  async getConfiguration({ id }: { id: string }) {
    logger.debug("Get configuration");
    return SmtpConfigContainer.getConfiguration(await this.getConfigurationRoot())({ id });
  }

  async getConfigurations(filter?: FilterConfigurationsArgs) {
    logger.debug("Get configuration");
    return SmtpConfigContainer.getConfigurations(await this.getConfigurationRoot())(filter);
  }

  async createConfiguration(config: Omit<SmtpConfiguration, "id" | "events">) {
    logger.debug("Create configuration");
    const updatedConfigurationRoot = SmtpConfigContainer.createConfiguration(
      await this.getConfigurationRoot()
    )(config);

    await this.setConfigurationRoot(updatedConfigurationRoot);

    return updatedConfigurationRoot.configurations[
      updatedConfigurationRoot.configurations.length - 1
    ];
  }

  async updateConfiguration(config: SmtpConfiguration) {
    logger.debug("Update configuration");
    const updatedConfigurationRoot = SmtpConfigContainer.updateConfiguration(
      await this.getConfigurationRoot()
    )(config);

    this.setConfigurationRoot(updatedConfigurationRoot);
  }

  async deleteConfiguration({ id }: { id: string }) {
    logger.debug("Delete configuration");
    const updatedConfigurationRoot = SmtpConfigContainer.deleteConfiguration(
      await this.getConfigurationRoot()
    )({ id });

    this.setConfigurationRoot(updatedConfigurationRoot);
  }
}
