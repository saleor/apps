import { describe, expect, it, vi } from "vitest";
import { SmtpConfigurationService } from "./smtp-configuration.service";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpMetadataManager } from "./smtp-metadata-manager";
import { SmtpConfig } from "./smtp-config-schema";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { Client } from "urql";
import { okAsync } from "neverthrow";

const mockSaleorApiUrl = "https://demo.saleor.io/graphql/";

const emptyConfigRoot: SmtpConfig = {
  configurations: [],
};

const validConfig: SmtpConfig = {
  configurations: [
    {
      id: "1685343953413npk9p",
      active: true,
      name: "Best name",
      smtpHost: "smtpHost",
      smtpPort: "1337",
      encryption: "NONE",
      channels: {
        override: false,
        channels: [],
        mode: "restrict",
      },
      events: [
        {
          active: true,
          eventType: "ORDER_CREATED",
          template: "template",
          subject: "Order {{ order.number }} has been created!!",
        },
        {
          active: false,
          eventType: "ORDER_FULFILLED",
          template: "template",
          subject: "Order {{ order.number }} has been fulfilled",
        },
        {
          active: false,
          eventType: "ORDER_CONFIRMED",
          template: "template",
          subject: "Order {{ order.number }} has been confirmed",
        },
        {
          active: false,
          eventType: "ORDER_CANCELLED",
          template: "template",
          subject: "Order {{ order.number }} has been cancelled",
        },
        {
          active: false,
          eventType: "ORDER_FULLY_PAID",
          template: "template",
          subject: "Order {{ order.number }} has been fully paid",
        },
        {
          active: false,
          eventType: "INVOICE_SENT",
          template: "template",
          subject: "New invoice has been created",
        },
        {
          active: false,
          eventType: "ACCOUNT_CONFIRMATION",
          template: "template",
          subject: "Account activation",
        },
        {
          active: false,
          eventType: "ACCOUNT_PASSWORD_RESET",
          template: "template",
          subject: "Password reset request",
        },
        {
          active: false,
          eventType: "ACCOUNT_CHANGE_EMAIL_REQUEST",
          template: "template",
          subject: "Email change request",
        },
        {
          active: false,
          eventType: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
          template: "template",
          subject: "Email change confirmation",
        },
        {
          active: false,
          eventType: "ACCOUNT_DELETE",
          template: "template",
          subject: "Account deletion",
        },
        {
          active: true,
          eventType: "GIFT_CARD_SENT",
          template: "template",
          subject: "Gift card sent",
        },
      ],
      smtpUser: "John",
      smtpPassword: "securepassword",
      senderEmail: "no-reply@example.com",
      senderName: "Sender Name",
    },
    {
      id: "1685343951244olejs",
      active: false,
      name: "Deactivated name",
      smtpHost: "smtpHost",
      smtpPort: "1337",
      encryption: "NONE",
      channels: {
        override: false,
        channels: [],
        mode: "restrict",
      },
      events: [
        {
          active: true,
          eventType: "ORDER_CREATED",
          template: "template",
          subject: "Order {{ order.number }} has been created!!",
        },
        {
          active: false,
          eventType: "ORDER_FULFILLED",
          template: "template",
          subject: "Order {{ order.number }} has been fulfilled",
        },
        {
          active: false,
          eventType: "ORDER_CONFIRMED",
          template: "template",
          subject: "Order {{ order.number }} has been confirmed",
        },
        {
          active: false,
          eventType: "ORDER_CANCELLED",
          template: "template",
          subject: "Order {{ order.number }} has been cancelled",
        },
        {
          active: false,
          eventType: "ORDER_FULLY_PAID",
          template: "template",
          subject: "Order {{ order.number }} has been fully paid",
        },
        {
          active: false,
          eventType: "INVOICE_SENT",
          template: "template",
          subject: "New invoice has been created",
        },
        {
          active: false,
          eventType: "ACCOUNT_CONFIRMATION",
          template: "template",
          subject: "Account activation",
        },
        {
          active: false,
          eventType: "ACCOUNT_PASSWORD_RESET",
          template: "template",
          subject: "Password reset request",
        },
        {
          active: false,
          eventType: "ACCOUNT_CHANGE_EMAIL_REQUEST",
          template: "template",
          subject: "Email change request",
        },
        {
          active: false,
          eventType: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
          template: "template",
          subject: "Email change confirmation",
        },
        {
          active: false,
          eventType: "ACCOUNT_DELETE",
          template: "template",
          subject: "Account deletion",
        },
      ],
      smtpUser: "John",
      smtpPassword: "securepassword",
      senderEmail: "no-reply@example.com",
      senderName: "Sender Name",
    },
  ],
};

describe("SmtpConfigurationService", function () {
  describe("constructor", () => {
    it("No API calls, when configuration is not requested", () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const getConfigMock = vi.spyOn(configurator, "getConfig").mockReturnValue(okAsync(undefined));

      new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
      });

      expect(getConfigMock).toBeCalledTimes(0);
    });
  });

  describe("getConfigurationRoot", () => {
    it("The API should be called and response reused, when no initial data provided", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const getConfigMock = vi
        .spyOn(configurator, "getConfig")
        .mockReturnValue(okAsync(validConfig));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
      });

      const configuration = await service.getConfigurationRoot();

      expect(configuration._unsafeUnwrap()).toEqual(validConfig);
      expect(getConfigMock).toBeCalledTimes(1);

      // Second call should not trigger API call
      await service.getConfigurationRoot();
      expect(getConfigMock).toBeCalledTimes(1);
    });

    it("The API should not be called when initial data were provided", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const getConfigMock = vi
        .spyOn(configurator, "getConfig")
        .mockReturnValue(okAsync(emptyConfigRoot));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      expect((await service.getConfigurationRoot())._unsafeUnwrap()).toEqual(validConfig);

      expect(getConfigMock).toBeCalledTimes(0);
    });
  });
  describe("setConfigurationRoot", () => {
    it("The API should be called and value cached, when saving the configuration", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));
      const getConfigMock = vi
        .spyOn(configurator, "getConfig")
        .mockReturnValue(okAsync(emptyConfigRoot));

      // Service initialized with empty configuration
      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: emptyConfigRoot,
      });

      // Set configuration
      await service["setConfigurationRoot"](validConfig);

      expect(setConfigMock).toBeCalledTimes(1);
      expect(setConfigMock).toBeCalledWith(validConfig);

      // Since data should be cached automatically, no API call should be triggered
      expect(await service.getConfigurationRoot());
      expect(getConfigMock).toBeCalledTimes(0);
    });

    it("Operation should be rejected, when attempting to save event not available according to feature flag", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      // Service initialized with empty configuration
      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.12.0", // This version does not support Gift Card event
        }),
        metadataManager: configurator,
        initialData: emptyConfigRoot,
      });

      /**
       * Should not do this - testing private method - but let it be until we decide to refactor
       */
      const result = await service["setConfigurationRoot"](validConfig);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.WrongSaleorVersionError,
      );
    });
  });

  describe("getConfiguration", () => {
    it("Returns configuration when existing ID is provided", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      expect(
        (await service.getConfiguration({ id: validConfig.configurations[0].id }))._unsafeUnwrap(),
      ).toEqual(validConfig.configurations[0]);
    });

    it("Throws error when configuration with provided ID does not exist", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const result = await service.getConfiguration({ id: "does-not-exist" });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );
    });
  });

  describe("getConfigurations", () => {
    it("Returns empty list when no configurations", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: emptyConfigRoot,
      });

      expect((await service.getConfigurations())._unsafeUnwrap()).toEqual([]);
    });

    it("Returns relevant configurations, when filter is passed", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      // Only the first configuration is active, so only this one should be returned
      expect((await service.getConfigurations({ active: true }))._unsafeUnwrap()).toEqual([
        validConfig.configurations[0],
      ]);
    });
  });

  describe("createConfiguration", () => {
    it("New configuration should be sent to API, when created", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: emptyConfigRoot,
      });

      const newConfiguration = (
        await service.createConfiguration({
          active: true,
          channels: { channels: [], mode: "exclude", override: false },
          encryption: "NONE",
          name: "New configuration",
          smtpHost: "smtp.example.com",
          smtpPort: "587",
        })
      )._unsafeUnwrap();

      expect(newConfiguration.name).toEqual("New configuration");
      expect(setConfigMock).toBeCalledTimes(1);
    });
  });

  describe("updateConfiguration", () => {
    it("Configuration should be updated, when method is called", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));
      const getConfigMock = vi.spyOn(configurator, "getConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const updatedConfiguration = (
        await service.updateConfiguration({
          id: validConfig.configurations[0].id,
          name: "Updated configuration",
        })
      )._unsafeUnwrap();

      expect(updatedConfiguration.name).toEqual("Updated configuration");
      expect(setConfigMock).toBeCalledTimes(1);

      const configurationFromCache = (
        await service.getConfiguration({
          id: validConfig.configurations[0].id,
        })
      )._unsafeUnwrap();

      expect(getConfigMock).toBeCalledTimes(0);
      expect(configurationFromCache.name).toEqual("Updated configuration");
    });

    it("Error should be thrown, when configuration with given ID does not exist", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));
      const getConfigMock = vi.spyOn(configurator, "getConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const result = await service.updateConfiguration({
        id: "this-id-does-not-exist",
        name: "Updated configuration",
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );
    });
  });

  describe("deleteConfiguration", () => {
    it("Configuration should be deleted, when method is called", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const idToBeDeleted = validConfig.configurations[0].id;

      await service.deleteConfiguration({
        id: idToBeDeleted,
      });

      // Change should be automatically pushed to the API
      expect(setConfigMock).toBeCalledTimes(1);

      const result = await service.getConfiguration({ id: idToBeDeleted });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );
    });
  });

  describe("deleteConfiguration", () => {
    it("Error should be thrown, when given ID does not exist", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const result = await service.deleteConfiguration({
        id: "this-id-does-not-exist",
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );

      // Since no changes were made, no API calls
      expect(setConfigMock).toBeCalledTimes(0);
    });
  });

  describe("getEventConfiguration", () => {
    it("Event configuration should be returned, when valid query", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      await expect(
        (
          await service.getEventConfiguration({
            configurationId: validConfig.configurations[0].id,
            eventType: "ORDER_CREATED",
          })
        )._unsafeUnwrap(),
      ).toEqual(validConfig.configurations[0].events[0]);
    });

    it("Should throw error, when configuration does not exist", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const notFoundError = await service.getEventConfiguration({
        configurationId: "this-id-does-not-exist",
        eventType: "ORDER_CREATED",
      });

      expect(notFoundError._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );

      const resultUnsupported = await service.getEventConfiguration({
        configurationId: validConfig.configurations[0].id,
        // @ts-ignore: Testing invalid event type
        eventType: "unsupported-event",
      });

      expect(resultUnsupported._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.EventConfigNotFoundError,
      );
    });
  });

  describe("updateEventConfiguration", () => {
    it("Event configuration should be updated, when valid data passed", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      await service.updateEventConfiguration({
        configurationId: validConfig.configurations[0].id,
        eventType: validConfig.configurations[0].events[0].eventType,
        eventConfiguration: {
          ...validConfig.configurations[0].events[0],
          subject: "Updated subject",
        },
      });

      expect(setConfigMock).toBeCalledTimes(1);

      const updatedEventConfiguration = (
        await service.getEventConfiguration({
          configurationId: validConfig.configurations[0].id,
          eventType: "ORDER_CREATED",
        })
      )._unsafeUnwrap();

      expect(updatedEventConfiguration.subject).toEqual("Updated subject");
    });

    it("Should throw error, when configuration does not exist", async () => {
      const configurator = new SmtpMetadataManager(
        null as unknown as SettingsManager,
        mockSaleorApiUrl,
      );

      const setConfigMock = vi.spyOn(configurator, "setConfig").mockReturnValue(okAsync(undefined));

      const service = new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion: "3.14.0",
        }),
        metadataManager: configurator,
        initialData: { ...validConfig },
      });

      const result = await service.updateEventConfiguration({
        configurationId: "this-id-does-not-exist",
        eventType: validConfig.configurations[0].events[0].eventType,
        eventConfiguration: {
          ...validConfig.configurations[0].events[0],
          subject: "Updated subject",
        },
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SmtpConfigurationService.ConfigNotFoundError,
      );

      expect(setConfigMock).toBeCalledTimes(0);
    });
  });
});
