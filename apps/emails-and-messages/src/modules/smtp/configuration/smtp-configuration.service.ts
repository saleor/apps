import { SmtpPrivateMetadataManager } from "./smtp-metadata-manager";
import { SmtpConfig, SmtpConfiguration, SmtpEventConfiguration } from "./smtp-config-schema";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { generateRandomId } from "../../../lib/generate-random-id";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";
import { filterConfigurations } from "../../app-configuration/filter-configurations";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { createLogger } from "../../../logger";

const logger = createLogger("SmtpConfigurationService");

export type SmtpConfigurationServiceErrorType =
  | "OTHER"
  | "CONFIGURATION_NOT_FOUND"
  | "EVENT_CONFIGURATION_NOT_FOUND"
  | "CANT_FETCH"
  | "WRONG_SALEOR_VERSION";

export interface ConfigurationPartial extends Partial<SmtpConfiguration> {
  id: SmtpConfiguration["id"];
}

export class SmtpConfigurationServiceError extends Error {
  errorType: SmtpConfigurationServiceErrorType = "OTHER";

  constructor(message: string, errorType: SmtpConfigurationServiceErrorType) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, SmtpConfigurationServiceError.prototype);
  }
}

export interface FilterConfigurationsArgs {
  ids?: string[];
  availableInChannel?: string;
  active?: boolean;
}

export class SmtpConfigurationService {
  private configurationData?: SmtpConfig;
  private metadataConfigurator: SmtpPrivateMetadataManager;
  private featureFlagService: FeatureFlagService;

  constructor(args: {
    metadataManager: SmtpPrivateMetadataManager;
    initialData?: SmtpConfig;
    featureFlagService: FeatureFlagService;
  }) {
    this.metadataConfigurator = args.metadataManager;

    if (args.initialData) {
      this.configurationData = args.initialData;
    }

    this.featureFlagService = args.featureFlagService;
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
   * Save configuration in the App private metadata using Saleor API.
   */
  private async pushConfiguration() {
    logger.debug("Push configuration to Saleor API");

    await this.metadataConfigurator.setConfig(this.configurationData!);
  }

  /**
   * Returns configuration from cache or fetches it from Saleor API.
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

      throw new SmtpConfigurationServiceError("API returned no configuration", "CANT_FETCH");
    }

    return this.configurationData;
  }

  private containActiveGiftCardEvent(config: SmtpConfig) {
    for (const configuration of config.configurations) {
      const giftCardSentEvent = configuration.events.find(
        (event) => event.eventType === "GIFT_CARD_SENT",
      );

      if (giftCardSentEvent?.active) {
        return true;
      }
    }
    return false;
  }

  // Saves configuration to Saleor API and cache it
  async setConfigurationRoot(config: SmtpConfig) {
    logger.debug("Validate configuration before sending it to the Saleor API");
    const availableFeatures = await this.featureFlagService.getFeatureFlags();

    if (!availableFeatures.giftCardSentEvent && this.containActiveGiftCardEvent(config)) {
      logger.error(
        "Attempt to enable gift card sent event for unsupported Saleor version. Aborting configuration update.",
      );
      throw new SmtpConfigurationServiceError(
        "Gift card sent event is not supported for this Saleor version",
        "WRONG_SALEOR_VERSION",
      );
    }

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
      throw new SmtpConfigurationServiceError("Configuration not found", "CONFIGURATION_NOT_FOUND");
    }

    return configuration;
  }

  /**
   * Get list of configurations. Optionally filter them.
   */
  async getConfigurations(filter?: FilterConfigurationsArgs) {
    logger.debug("Get configurations");
    const configurationRoot = await this.getConfigurationRoot();

    return filterConfigurations<SmtpConfiguration>({
      configurations: configurationRoot.configurations,
      filter,
    });
  }

  async createConfiguration(config: Omit<SmtpConfiguration, "id" | "events">) {
    logger.debug("Create configuration");
    const configurationRoot = await this.getConfigurationRoot();

    const newConfiguration = {
      ...config,
      id: generateRandomId(),
      events: smtpDefaultEmptyConfigurations.eventsConfiguration(),
    };

    configurationRoot.configurations.push(newConfiguration);

    await this.setConfigurationRoot(configurationRoot);

    return newConfiguration;
  }

  /**
   * Update existing configuration. If not found, throws an error.
   */
  async updateConfiguration(configuration: ConfigurationPartial) {
    logger.debug("Update configuration");

    // Will trow error if configuration not found
    const existingConfiguration = await this.getConfiguration({ id: configuration.id });

    const updatedConfiguration = { ...existingConfiguration, ...configuration };

    const configurationRoot = await this.getConfigurationRoot();

    const configurationIndex = configurationRoot.configurations.findIndex(
      (conf) => conf.id === configuration.id,
    );

    const updatedConfigRoot = structuredClone(configurationRoot);

    updatedConfigRoot.configurations[configurationIndex] = updatedConfiguration;

    await this.setConfigurationRoot(updatedConfigRoot);

    return updatedConfiguration;
  }

  /**
   * Delete existing configuration. If not found, throws an error.
   */
  async deleteConfiguration({ id }: { id: string }) {
    logger.debug("Delete configuration");

    // Will trow error if configuration not found
    await this.getConfiguration({ id });

    const updatedConfigRoot = structuredClone(this.configurationData!);

    updatedConfigRoot.configurations = updatedConfigRoot.configurations.filter(
      (configuration) => configuration.id !== id,
    );

    await this.setConfigurationRoot(updatedConfigRoot);
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
      throw new SmtpConfigurationServiceError(
        "Event configuration not found",
        "EVENT_CONFIGURATION_NOT_FOUND",
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
    eventType,
  }: {
    configurationId: string;
    eventType: SmtpEventConfiguration["eventType"];
    eventConfiguration: Partial<Omit<SmtpEventConfiguration, "eventType">>;
  }) {
    logger.debug("Update event configuration");
    const configuration = await this.getConfiguration({
      id: configurationId,
    });

    const eventIndex = configuration.events.findIndex((e) => e.eventType === eventType);

    if (eventIndex < 0) {
      logger.warn("Event configuration not found, throwing an error");
      throw new SmtpConfigurationServiceError(
        "Event configuration not found",
        "EVENT_CONFIGURATION_NOT_FOUND",
      );
    }

    const updatedEventConfiguration = {
      ...configuration.events[eventIndex],
      ...eventConfiguration,
    };

    configuration.events[eventIndex] = updatedEventConfiguration;

    await this.updateConfiguration(configuration);
    return updatedEventConfiguration;
  }
}
