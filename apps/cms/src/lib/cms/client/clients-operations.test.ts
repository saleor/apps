import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { describe, expect, it, vi } from "vitest";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";
import { CmsClientOperations } from "../types";
import { createCmsOperations } from "./clients-operations";
import { createCmsKeyForSaleorItem } from "./metadata";
import * as Settings from "./settings";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

const mockedContext: Pick<WebhookContext, "authData"> = {
  authData: {
    saleorApiUrl: "url",
    token: "token",
    appId: "appId",
    domain: "domain",
    jwks: "jwks",
  },
};

vi.mock("../../metadata", () => ({
  createSettingsManager: () => ({}),
}));

describe("CMS Clients Operations", () => {
  it("should return no creation operations when no channels to update passed and no cms to update passed", async () => {
    vi.spyOn(Settings, "getChannelsSettings").mockImplementationOnce(async () => ({}));
    vi.spyOn(Settings, "getProviderInstancesSettings").mockImplementationOnce(async () => ({}));
    vi.spyOn(Settings, "getProductVariantProviderInstancesToAlter").mockImplementationOnce(
      async () =>
        ({
          toCreate: [],
          toUpdate: [],
          toRemove: [],
        } as Settings.ProductVariantProviderInstancesToAlter)
    );

    const cmsOperations = await createCmsOperations({
      context: mockedContext,
      channelsToUpdate: [],
      cmsKeysToUpdate: [],
    });

    expect(cmsOperations).toEqual<CmsClientOperations[]>([]);
  });

  it("should return create operation when variant with channel listing that does not exist in provider instance passed", async () => {
    vi.spyOn(Settings, "getChannelsSettings").mockImplementationOnce(
      async () =>
        ({
          "default-channel": {
            channelSlug: "default-channel",
            enabledProviderInstances: ["first-provider"],
          },
          "other-channel": {
            channelSlug: "other-channel",
            enabledProviderInstances: ["first-provider", "second-provider"],
          },
        } as CMSSchemaChannels)
    );
    vi.spyOn(Settings, "getProviderInstancesSettings").mockImplementationOnce(
      async () =>
        ({
          "first-provider": {
            name: "First provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "third-provider",
            providerName: "strapi",
          },
        } as CMSSchemaProviderInstances)
    );
    // Following mock assumes function calculations went correct and returns correct values
    vi.spyOn(Settings, "getProductVariantProviderInstancesToAlter").mockImplementationOnce(
      async () =>
        ({
          toCreate: ["first-provider"],
          toUpdate: [],
          toRemove: [],
        } as Settings.ProductVariantProviderInstancesToAlter)
    );

    const cmsOperations = await createCmsOperations({
      context: mockedContext,
      channelsToUpdate: ["default-channel"],
      cmsKeysToUpdate: [],
    });

    expect(cmsOperations).toEqual<CmsClientOperations[]>([
      {
        cmsProviderInstanceId: "first-provider",
        operationType: "createProduct",
        operations: {
          createProduct: expect.any(Function),
          deleteProduct: expect.any(Function),
          updateProduct: expect.any(Function),
        },
      },
    ]);
  });

  it("should return update operation when variant with channel listing that exists in provider instance passed", async () => {
    vi.spyOn(Settings, "getChannelsSettings").mockImplementationOnce(
      async () =>
        ({
          "default-channel": {
            channelSlug: "default-channel",
            enabledProviderInstances: ["first-provider"],
          },
          "other-channel": {
            channelSlug: "other-channel",
            enabledProviderInstances: ["first-provider", "second-provider"],
          },
        } as CMSSchemaChannels)
    );
    vi.spyOn(Settings, "getProviderInstancesSettings").mockImplementationOnce(
      async () =>
        ({
          "first-provider": {
            name: "First provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "third-provider",
            providerName: "strapi",
          },
        } as CMSSchemaProviderInstances)
    );
    // Following mock assumes function calculations went correct and returns correct values
    vi.spyOn(Settings, "getProductVariantProviderInstancesToAlter").mockImplementationOnce(
      async () =>
        ({
          toCreate: [],
          toUpdate: ["first-provider"],
          toRemove: [],
        } as Settings.ProductVariantProviderInstancesToAlter)
    );

    const cmsOperations = await createCmsOperations({
      context: mockedContext,
      channelsToUpdate: ["default-channel"],
      cmsKeysToUpdate: [createCmsKeyForSaleorItem("first-provider")],
    });

    expect(cmsOperations).toEqual<CmsClientOperations[]>([
      {
        cmsProviderInstanceId: "first-provider",
        operationType: "updateProduct",
        operations: {
          createProduct: expect.any(Function),
          deleteProduct: expect.any(Function),
          updateProduct: expect.any(Function),
        },
      },
    ]);
  });

  it("should return delete operation when variant without channel listing that exists in provider instance passed", async () => {
    vi.spyOn(Settings, "getChannelsSettings").mockImplementationOnce(
      async () =>
        ({
          "default-channel": {
            channelSlug: "default-channel",
            enabledProviderInstances: ["first-provider"],
          },
          "other-channel": {
            channelSlug: "other-channel",
            enabledProviderInstances: ["first-provider", "second-provider"],
          },
        } as CMSSchemaChannels)
    );
    vi.spyOn(Settings, "getProviderInstancesSettings").mockImplementationOnce(
      async () =>
        ({
          "first-provider": {
            name: "First provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "baseUrl",
            id: "third-provider",
            providerName: "strapi",
          },
        } as CMSSchemaProviderInstances)
    );
    // Following mock assumes function calculations went correct and returns correct values
    vi.spyOn(Settings, "getProductVariantProviderInstancesToAlter").mockImplementationOnce(
      async () =>
        ({
          toCreate: [],
          toUpdate: [],
          toRemove: ["first-provider"],
        } as Settings.ProductVariantProviderInstancesToAlter)
    );

    const cmsOperations = await createCmsOperations({
      context: mockedContext,
      channelsToUpdate: [],
      cmsKeysToUpdate: [createCmsKeyForSaleorItem("first-provider")],
    });

    expect(cmsOperations).toEqual<CmsClientOperations[]>([
      {
        cmsProviderInstanceId: "first-provider",
        operationType: "deleteProduct",
        operations: {
          createProduct: expect.any(Function),
          deleteProduct: expect.any(Function),
          updateProduct: expect.any(Function),
        },
      },
    ]);
  });
});
