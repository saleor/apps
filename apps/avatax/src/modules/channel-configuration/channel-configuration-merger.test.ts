import { describe, expect, it } from "vitest";
import { ChannelConfigMockGenerator } from "./channel-config-mock-generator";
import { ChannelFetcherMockGenerator } from "./channel-fetcher-mock-generator";
import { ChannelConfigurationMerger } from "./channel-configuration-merger";

const channelMockGenerator = new ChannelFetcherMockGenerator();
const channelConfigMockGenerator = new ChannelConfigMockGenerator();
const configurationMerger = new ChannelConfigurationMerger();

describe("ChannelConfigurationMerger", () => {
  it("should return config with providerConnectionId when match", () => {
    const channels = [channelMockGenerator.generateChannel()];
    const channelConfig = channelConfigMockGenerator.generateChannelConfig();

    const result = configurationMerger.merge(channels, [channelConfig]);

    expect(result).toEqual([
      {
        id: expect.any(String),
        config: {
          providerConnectionId: "aa5293e5-7f5d-4782-a619-222ead918e50",
          slug: "default-channel",
        },
      },
    ]);
  });
  it("should return config with providerConnectionId = null when no match", () => {
    const channels = [channelMockGenerator.generateChannel()];
    const channelConfig = channelConfigMockGenerator.generateChannelConfig({
      config: {
        providerConnectionId: "1234",
        slug: "different-channel",
      },
    });

    const result = configurationMerger.merge(channels, [channelConfig]);

    expect(result).toEqual([
      {
        id: expect.any(String),
        config: {
          providerConnectionId: null,
          slug: "default-channel",
        },
      },
    ]);
  });
});
