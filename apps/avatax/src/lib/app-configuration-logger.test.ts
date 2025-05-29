import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
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
    const logger = new AppConfigurationLogger({ warn: mockWarn, info: mockInfo, debug: vi.fn() });

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
});
