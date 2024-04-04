import { describe, it, expect } from "vitest";
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

    it.todo(
      "returns InvalidChannelSlugError if provided slug is not available in saved config (items in collection variant)",
    );

    it.todo(
      "returns MissingConfigurationError if channel was found, but there is no configuration assigned to it",
    );

    it.todo("returns valid configuration for provided channel slug, if exists");
  });
});
