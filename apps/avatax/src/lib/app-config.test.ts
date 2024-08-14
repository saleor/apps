import { describe, expect, it } from "vitest";

import { AppConfig } from "./app-config";

describe("AppConfig", () => {
  describe("getConfigForChannelSlug", () => {
    it("returns InvalidChannelSlugError if provided slug is not available in saved config (empty collection variant)", () => {
      const config = AppConfig.createFromParsedConfig({
        channels: [],
        providerConnections: [],
      });

      const result = config.getConfigForChannelSlug("default-channel");

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppConfig.InvalidChannelSlugError);
      expect(result._unsafeUnwrapErr()).toMatchObject({
        channelSlug: "default-channel",
      });
    });

    it("returns InvalidChannelSlugError if provided slug is not available in saved config (items in collection variant)", () => {
      const config = AppConfig.createFromParsedConfig({
        channels: [
          {
            id: "1",
            config: {
              slug: "default-channel",
              providerConnectionId: "pci-1",
            },
          },
        ],
        providerConnections: [
          {
            provider: "avatax",
            id: "pci-1",
            config: {
              companyCode: "test",
              credentials: {
                password: "test",
                username: "test",
              },
              address: {
                city: "test",
                country: "test",
                zip: "10111",
                state: "NY",
                street: "test",
              },
              isSandbox: false,
              name: "config",
              isAutocommit: false,
              isDocumentRecordingEnabled: false,
              shippingTaxCode: "123",
            },
          },
        ],
      });

      const result = config.getConfigForChannelSlug("another-channel");

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppConfig.InvalidChannelSlugError);
      expect(result._unsafeUnwrapErr()).toMatchObject({
        channelSlug: "another-channel",
      });
    });

    it("returns MissingConfigurationError if channel was found, but there is no configuration assigned to it", () => {
      const config = AppConfig.createFromParsedConfig({
        channels: [
          {
            id: "1",
            config: {
              slug: "default-channel",
              providerConnectionId: "pci-1",
            },
          },
        ],
        providerConnections: [],
      });

      const result = config.getConfigForChannelSlug("default-channel");

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppConfig.MissingConfigurationError);
      expect(result._unsafeUnwrapErr()).toMatchObject({
        channelSlug: "default-channel",
      });
    });

    it("returns valid configuration for provided channel slug, if exists", () => {
      const config = AppConfig.createFromParsedConfig({
        channels: [
          {
            id: "1",
            config: {
              slug: "default-channel",
              providerConnectionId: "pci-1",
            },
          },
        ],
        providerConnections: [
          {
            provider: "avatax",
            id: "pci-1",
            config: {
              companyCode: "test",
              credentials: {
                password: "test",
                username: "test",
              },
              address: {
                city: "test",
                country: "test",
                zip: "10111",
                state: "NY",
                street: "test",
              },
              isSandbox: false,
              name: "config",
              isAutocommit: false,
              isDocumentRecordingEnabled: false,
              shippingTaxCode: "123",
            },
          },
        ],
      });

      const result = config.getConfigForChannelSlug("default-channel");

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        {
          "avataxConfig": {
            "config": {
              "address": {
                "city": "test",
                "country": "test",
                "state": "NY",
                "street": "test",
                "zip": "10111",
              },
              "companyCode": "test",
              "credentials": {
                "password": "test",
                "username": "test",
              },
              "isAutocommit": false,
              "isDocumentRecordingEnabled": false,
              "isSandbox": false,
              "name": "config",
              "shippingTaxCode": "123",
            },
            "id": "pci-1",
            "provider": "avatax",
          },
          "channelConfigInternalId": "1",
          "channelSlug": "default-channel",
        }
      `);
    });
  });
});
