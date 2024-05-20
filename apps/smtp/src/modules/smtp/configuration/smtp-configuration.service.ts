import { SmtpMetadataManager } from "./smtp-metadata-manager";
import { SmtpConfig, SmtpConfiguration, SmtpEventConfiguration } from "./smtp-config-schema";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { generateRandomId } from "../../../lib/generate-random-id";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";
import { filterConfigurations } from "../../app-configuration/filter-configurations";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { createLogger } from "../../../logger";
import { BaseError } from "../../../errors";
import { err, errAsync, fromAsyncThrowable, ok, okAsync, ResultAsync } from "neverthrow";

const logger = createLogger("SmtpConfigurationService");

export interface ConfigurationPartial extends Partial<SmtpConfiguration> {
  id: SmtpConfiguration["id"];
}

export interface FilterConfigurationsArgs {
  ids?: string[];
  availableInChannel?: string;
  active?: boolean;
}

export interface IGetSmtpConfiguration {
  getConfigurations(
    filter?: FilterConfigurationsArgs,
  ): ResultAsync<SmtpConfiguration[], InstanceType<typeof BaseError>>;
}

export class SmtpConfigurationService implements IGetSmtpConfiguration {
  static SmtpConfigurationServiceError = BaseError.subclass("SmtpConfigurationServiceError");
  static ConfigNotFoundError = BaseError.subclass("ConfigNotFoundError");
  static EventConfigNotFoundError = BaseError.subclass("EventConfigNotFoundError");
  static CantFetchConfigError = BaseError.subclass("CantFetchConfigError");
  static WrongSaleorVersionError = BaseError.subclass("WrongSaleorVersionError");

  private configurationData?: SmtpConfig;
  private metadataConfigurator: SmtpMetadataManager;
  private featureFlagService: FeatureFlagService;

  constructor(args: {
    metadataManager: SmtpMetadataManager;
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
  private pullConfiguration(): ResultAsync<SmtpConfig, InstanceType<typeof BaseError>> {
    logger.debug("Trying to fetch configuration from Saleor API");

    return this.metadataConfigurator
      .getConfig()
      .andThen((data) => {
        if (!data) {
          logger.debug("No configuration found in Saleor API, creating a new one");

          return okAsync({ configurations: [] });
        }
        return okAsync(data);
      })
      .andThen((data) => {
        logger.debug("Set configuration data in memory");

        this.configurationData = data;

        return okAsync(data);
      });
  }

  /**
   * Save configuration in the App private metadata using Saleor API.
   */
  private pushConfiguration() {
    logger.debug("Pushing configuration to Saleor API");

    return this.metadataConfigurator.setConfig(this.configurationData!);
  }

  /**
   * Returns configuration from cache or fetches it from Saleor API.
   */
  getConfigurationRoot(): ResultAsync<
    SmtpConfig,
    InstanceType<typeof SmtpConfigurationService.SmtpConfigurationServiceError>
  > {
    logger.debug("Get configuration root");

    return okAsync(this.configurationData)
      .andThen((data) => {
        if (!data) {
          return this.pullConfiguration();
        }

        return ok(data);
      })
      .orElse((error) => {
        return err(
          new SmtpConfigurationService.CantFetchConfigError("API returned no configuration", {
            errors: [error],
          }),
        );
      });
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
  private setConfigurationRoot(config: SmtpConfig) {
    logger.debug("Validate configuration before sending it to the Saleor API");

    return fromAsyncThrowable(
      this.featureFlagService.getFeatureFlags,
      SmtpConfigurationService.SmtpConfigurationServiceError.normalize,
    )().andThen((features) => {
      if (!features.giftCardSentEvent && this.containActiveGiftCardEvent(config)) {
        logger.error(
          "Attempt to enable gift card sent event for unsupported Saleor version. Aborting configuration update.",
        );

        return errAsync(
          new SmtpConfigurationService.WrongSaleorVersionError(
            "Gift card sent event is not supported for this Saleor version",
          ),
        );
      }

      logger.debug("Set configuration root");

      this.configurationData = config;

      return this.pushConfiguration();
    });
  }

  /**
   * Get configuration for given ID. Throws if not found.
   */
  getConfiguration({ id }: { id: string }) {
    logger.debug("Get configuration");

    return this.getConfigurationRoot().andThen((config) => {
      const configuration = config.configurations.find((conf) => conf.id === id);

      if (!configuration) {
        return errAsync(
          new SmtpConfigurationService.ConfigNotFoundError("Configuration not found"),
        );
      }

      return okAsync(configuration);
    });
  }

  /**
   * Get list of configurations. Optionally filter them.
   */
  getConfigurations(filter?: FilterConfigurationsArgs) {
    logger.debug("Get configurations");

    return this.getConfigurationRoot().andThen((config) => {
      return okAsync(
        filterConfigurations<SmtpConfiguration>({
          configurations: config.configurations,
          filter,
        }),
      );
    });
  }

  createConfiguration(config: Omit<SmtpConfiguration, "id" | "events">) {
    logger.debug("Create configuration");

    return this.getConfigurationRoot().andThen((configurationRoot) => {
      const newConfiguration = {
        ...config,
        id: generateRandomId(),
        events: smtpDefaultEmptyConfigurations.eventsConfiguration(),
      };

      configurationRoot.configurations.push(newConfiguration);

      return this.setConfigurationRoot(configurationRoot).andThen((result) => {
        return okAsync(newConfiguration);
      });
    });
  }

  /**
   * Update existing configuration. If not found, throws an error.
   */
  updateConfiguration(configuration: ConfigurationPartial) {
    logger.debug("Update configuration");

    return this.getConfiguration({ id: configuration.id }).andThen((existingConfiguration) => {
      const updatedConfiguration = { ...existingConfiguration, ...configuration };

      return this.getConfigurationRoot().andThen((configurationRoot) => {
        const configurationIndex = configurationRoot.configurations.findIndex(
          (conf) => conf.id === configuration.id,
        );

        const updatedConfigRoot = structuredClone(configurationRoot);

        updatedConfigRoot.configurations[configurationIndex] = updatedConfiguration;

        return this.setConfigurationRoot(updatedConfigRoot).andThen(() =>
          okAsync(updatedConfiguration),
        );
      });
    });
  }

  /**
   * Delete existing configuration. If not found, throws an error.
   */
  deleteConfiguration({ id }: { id: string }) {
    logger.debug("Delete configuration");

    return this.getConfiguration({ id }).andThen((config) => {
      const updatedConfigRoot = structuredClone(this.configurationData!);

      updatedConfigRoot.configurations = updatedConfigRoot.configurations.filter(
        (configuration) => configuration.id !== id,
      );

      return this.setConfigurationRoot(updatedConfigRoot);
    });
  }

  /**
   * Get event configuration for given configuration ID and event type. Throws if not found.
   */
  getEventConfiguration({
    configurationId,
    eventType,
  }: {
    configurationId: string;
    eventType: MessageEventTypes;
  }) {
    logger.debug("Get event configuration");

    return this.getConfiguration({
      id: configurationId,
    }).andThen((config) => {
      const event = config.events.find((e) => e.eventType === eventType);

      if (!event) {
        return errAsync(
          new SmtpConfigurationService.EventConfigNotFoundError("Event configuration not found"),
        );
      }

      return okAsync(event);
    });
  }

  /**
   * Update event configuration for given configuration ID and event type. Throws if not found.
   */
  updateEventConfiguration({
    configurationId,
    eventConfiguration,
    eventType,
  }: {
    configurationId: string;
    eventType: MessageEventTypes;
    eventConfiguration: Partial<Omit<SmtpEventConfiguration, "eventType">>;
  }) {
    logger.debug("Update event configuration");

    return this.getConfiguration({
      id: configurationId,
    }).andThen((config) => {
      const eventIndex = config.events.findIndex((e) => e.eventType === eventType);

      if (eventIndex < 0) {
        logger.warn("Event configuration not found, throwing an error");

        return errAsync(
          new SmtpConfigurationService.EventConfigNotFoundError("Event configuration not found"),
        );
      }

      const updatedEventConfiguration = {
        ...config.events[eventIndex],
        ...eventConfiguration,
      };

      config.events[eventIndex] = updatedEventConfiguration;

      return this.updateConfiguration(config).andThen(() => {
        return okAsync(updatedEventConfiguration);
      });
    });
  }
}
