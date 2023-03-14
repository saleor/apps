import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { describe, expect, it, vi } from "vitest";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";
import { CmsClientOperations } from "../types";
import { createCmsOperations } from "./clients-operations";
import { createCmsKeyForSaleorItem } from "./metadata";
import { getProductVariantProviderInstancesToAlter } from "./settings";

vi.mock("../../metadata", () => ({
  createSettingsManager: () => ({}),
}));

describe("CMS Clients Operations", () => {
  // todo: fix tests
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
      channelsToUpdate: ["default-channel"],
      cmsKeysToUpdate: [],
    });

    expect(providerInstances).toEqual({
      toCreate: ["first-provider"],
      toUpdate: [],
      toRemove: [],
    });
  });

  // todo: fix tests
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
      channelsToUpdate: ["default-channel"],
      cmsKeysToUpdate: [createCmsKeyForSaleorItem("first-provider")],
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
      channelsToUpdate: [],
      cmsKeysToUpdate: [createCmsKeyForSaleorItem("first-provider")],
    });

    expect(providerInstances).toEqual({
      toCreate: [],
      toUpdate: [],
      toRemove: ["first-provider"],
    });
  });
});
