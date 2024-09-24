import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppConfig } from "./app-config";
import { AppConfigurationLogger } from "./app-configuration-logger";

describe("AppConfigurationLogger", () => {
  const mockWarn = vi.fn();
  const mockInfo = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Logs warning if config cant be parsed properly", () => {
    const logger = new AppConfigurationLogger({ warn: mockWarn, info: mockInfo });

    logger.logConfiguration(
      AppConfig.createFromParsedConfig({
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
      }),
      "default-channel",
    );

    expect(mockWarn).toHaveBeenCalledWith("Failed to resolve configuration properly", {
      [ObservabilityAttributes.CHANNEL_SLUG]: "default-channel",
      error: expect.any(AppConfig.MissingConfigurationError),
    });
  });

  it("Logs info with redacted config contents", () => {
    const logger = new AppConfigurationLogger({ warn: mockWarn, info: mockInfo });

    logger.logConfiguration(
      AppConfig.createFromParsedConfig({
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
      }),
      "default-channel",
    );

    expect(mockInfo).toHaveBeenCalledWith("Received configuration", {
      address: JSON.stringify({
        city: "test",
        country: "test",
        zip: "10111",
        state: "NY",
        street: "test",
      }),
      appConfigName: "config",
      channelSlug: "default-channel",
      companyCode: "test",
      isAutocommit: false,
      isDocumentRecordingEnabled: false,
      isSandbox: false,
      password: "<Exists>",
      shippingTaxCode: "123",
      username: "tes...",
    });
  });
});
