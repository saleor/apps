import { SendgridPrivateMetadataManager } from "./sendgrid-metadata-manager";
import { createLogger } from "@saleor/apps-shared";
import { getDefaultEventsConfiguration } from "./sendgrid-empty-configurations";
import {
  SendgridConfig,
  SendgridConfiguration,
  SendgridEventConfiguration,
} from "./sendgrid-config-schema";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { isAvailableInChannel } from "../../channels/is-available-in-channel";
import { generateRandomId } from "../../../lib/generate-random-id";

const logger = createLogger({
  service: "SendgridConfigurationService",
});

export type SendgridConfigurationServiceErrorType =
  | "OTHER"
  | "CONFIGURATION_NOT_FOUND"
  | "EVENT_CONFIGURATION_NOT_FOUND"
  | "CANT_FETCH";

export interface ConfigurationPartial extends Partial<SendgridConfiguration> {
  id: SendgridConfiguration["id"];
}

export class SendgridConfigurationServiceError extends Error {
  errorType: SendgridConfigurationServiceErrorType = "OTHER";

  constructor(message: string, errorType: SendgridConfigurationServiceErrorType) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, SendgridConfigurationServiceError.prototype);
  }
}

export interface FilterConfigurationsArgs {
  ids?: string[];
  availableInChannel?: string;
  active?: boolean;
}

export class SendgridConfigurationService {
  private configurationData?: SendgridConfig;
  private metadataConfigurator: SendgridPrivateMetadataManager;

  constructor(args: {
    metadataManager: SendgridPrivateMetadataManager;
    initialData?: SendgridConfig;
  }) {
    this.metadataConfigurator = args.metadataManager;

    if (args.initialData) {
      this.configurationData = args.initialData;
    }
  }

  /**
   * Fetch configuration from Saleor API and cache it.
   * If configuration is not found, create a new, empty one.
   */
  private async pullConfiguration() {
    logger.debug("Fetch configuration from Saleor API");

    const config = (await this.metadataConfigurator.getConfig()) || { configurations: [] };

    this.configurationData = config;
  }

  /**
   * Push configuration to Saleor API
   */
  private async pushConfiguration() {
    logger.debug("Push configuration to Saleor API");

    await this.metadataConfigurator.setConfig(this.configurationData!);
  }

  /**
   * Returns configuration from cache or fetches it from Saleor API
   */
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

      throw new SendgridConfigurationServiceError("API returned no configuration", "CANT_FETCH");
    }

    return this.configurationData;
  }

  // Saves configuration to Saleor API and cache it
  async setConfigurationRoot(config: SendgridConfig) {
    logger.debug("Set configuration root");

    this.configurationData = config;
    await this.pushConfiguration();
  }

  /**
   * Get configuration for given ID. Throws if not found.
   */
  async getConfiguration({ id }: { id: string }) {
    logger.debug("Get configuration");
    const configurationRoot = await this.getConfigurationRoot();

    const configuration = configurationRoot.configurations.find((conf) => conf.id === id);

    if (!configuration) {
      throw new SendgridConfigurationServiceError(
        "Configuration not found",
        "CONFIGURATION_NOT_FOUND"
      );
    }

    return configuration;
  }

  /**
   * Get list of configurations. Optionally filter them.
   */
  async getConfigurations(filter?: FilterConfigurationsArgs) {
    logger.debug("Get configurations");
    const configurationRoot = await this.getConfigurationRoot();

    let filtered = configurationRoot.configurations;

    if (!filter) {
      return filtered;
    }

    if (filter.ids?.length) {
      filtered = filtered.filter((c) => filter?.ids?.includes(c.id));
    }

    if (filter.active !== undefined) {
      filtered = filtered.filter((c) => c.active === filter.active);
    }

    if (filter.availableInChannel?.length) {
      filtered = filtered.filter((c) =>
        isAvailableInChannel({
          channel: filter.availableInChannel!,
          channelConfiguration: c.channels,
        })
      );
    }

    return filtered;
  }

  /**
   * Create a new configuration
   */
  async createConfiguration(config: Omit<SendgridConfiguration, "id" | "events">) {
    logger.debug("Create configuration");
    const configurationRoot = await this.getConfigurationRoot();

    const newConfiguration = {
      ...config,
      id: generateRandomId(),
      events: getDefaultEventsConfiguration(),
    };

    configurationRoot.configurations.push(newConfiguration);

    await this.setConfigurationRoot(configurationRoot);

    return newConfiguration;
  }

  /**
   * Update existing configuration. If not found, throws an error
   */
  async updateConfiguration(configuration: ConfigurationPartial) {
    logger.debug("Update configuration");

    // Will trow error if configuration not found
    const existingConfiguration = await this.getConfiguration({ id: configuration.id });

    const updatedConfiguration = { ...existingConfiguration, ...configuration };

    const configurationRoot = await this.getConfigurationRoot();

    const configurationIndex = configurationRoot.configurations.findIndex(
      (conf) => conf.id === configuration.id
    );

    const updatedConfigRoot = structuredClone(configurationRoot);

    updatedConfigRoot.configurations[configurationIndex] = updatedConfiguration;

    this.setConfigurationRoot(updatedConfigRoot);

    return updatedConfiguration;
  }

  /**
   * Delete existing configuration. If not found, throws an error
   */
  async deleteConfiguration({ id }: { id: string }) {
    logger.debug("Delete configuration");

    // Will trow error if configuration not found
    await this.getConfiguration({ id });

    const updatedConfigRoot = structuredClone(this.configurationData!);

    updatedConfigRoot.configurations = updatedConfigRoot.configurations.filter(
      (configuration) => configuration.id !== id
    );

    this.setConfigurationRoot(updatedConfigRoot);
  }

  /**
   * Get event configuration for given configuration ID and event type. Throws if not found.
   */
  async getEventConfiguration({
    configurationId,
    eventType,
  }: {
    configurationId: string;
    eventType: MessageEventTypes;
  }) {
    logger.debug("Get event configuration");
    const configuration = await this.getConfiguration({
      id: configurationId,
    });

    const event = configuration.events.find((e) => e.eventType === eventType);

    if (!event) {
      throw new SendgridConfigurationServiceError(
        "Event configuration not found",
        "EVENT_CONFIGURATION_NOT_FOUND"
      );
    }

    return event;
  }

  /**
   * Update event configuration for given configuration ID and event type. Throws if not found.
   */
  async updateEventConfiguration({
    configurationId,
    eventConfiguration,
  }: {
    configurationId: string;
    eventConfiguration: SendgridEventConfiguration;
  }) {
    logger.debug("Update event configuration");
    const configuration = await this.getConfiguration({
      id: configurationId,
    });

    const eventIndex = configuration.events.findIndex(
      (e) => e.eventType === eventConfiguration.eventType
    );

    if (eventIndex < 0) {
      logger.warn("Event configuration not found, throwing an error");
      throw new SendgridConfigurationServiceError(
        "Event configuration not found",
        "EVENT_CONFIGURATION_NOT_FOUND"
      );
    }

    configuration.events[eventIndex] = eventConfiguration;

    await this.updateConfiguration(configuration);
    return configuration;
  }
}
