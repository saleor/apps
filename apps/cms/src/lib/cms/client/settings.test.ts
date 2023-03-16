import { describe, expect, it, vi } from "vitest";
import { CMSSchemaChannels } from "../config";
import { getProductVariantProviderInstancesToAlter } from "./settings";

vi.mock("../../metadata", () => ({
  createSettingsManager: () => ({}),
}));

describe("CMS Clients Operations", () => {
  it("should return provider instance in create group when variant channel listing passed and channel provider instance not passed", async () => {
    const channelsSettings = {
      "default-channel": {
        channelSlug: "default-channel",
        enabledProviderInstances: ["first-provider"],
      },
      "other-channel": {
        channelSlug: "other-channel",
        enabledProviderInstances: ["first-provider", "second-provider"],
      },
    } as CMSSchemaChannels;

    const providerInstances = await getProductVariantProviderInstancesToAlter({
      channelsSettingsParsed: channelsSettings,
      productVariantChannels: ["default-channel"], // function should infer that variant has ["first-provider"]
      productVariantCmsProviderInstances: [],
    });

    expect(providerInstances).toEqual({
      toCreate: ["first-provider"],
      toUpdate: [],
      toRemove: [],
    });
  });

  it("should return provider instance in update group when variant channel listing passed and channel provider instance passed", async () => {
    const channelsSettings = {
      "default-channel": {
        channelSlug: "default-channel",
        enabledProviderInstances: ["first-provider"],
      },
      "other-channel": {
        channelSlug: "other-channel",
        enabledProviderInstances: ["first-provider", "second-provider"],
      },
    } as CMSSchemaChannels;

    const providerInstances = await getProductVariantProviderInstancesToAlter({
      channelsSettingsParsed: channelsSettings,
      productVariantChannels: ["default-channel"], // function should infer that variant has ["first-provider"]
      productVariantCmsProviderInstances: ["first-provider"],
    });

    expect(providerInstances).toEqual({
      toCreate: [],
      toUpdate: ["first-provider"],
      toRemove: [],
    });
  });

  it("should return provider instance in remove group when variant channel listing not passed and channel provider instance passed", async () => {
    const channelsSettings = {
      "default-channel": {
        channelSlug: "default-channel",
        enabledProviderInstances: ["first-provider"],
      },
      "other-channel": {
        channelSlug: "other-channel",
        enabledProviderInstances: ["first-provider", "second-provider"],
      },
    } as CMSSchemaChannels;

    const providerInstances = await getProductVariantProviderInstancesToAlter({
      channelsSettingsParsed: channelsSettings,
      productVariantChannels: [], // function should infer that variant has []
      productVariantCmsProviderInstances: ["first-provider"],
    });

    expect(providerInstances).toEqual({
      toCreate: [],
      toUpdate: [],
      toRemove: ["first-provider"],
    });
  });
});
