import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { type Client } from "urql";
import { describe, expect, it, vi } from "vitest";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";
import { CmsClientOperations } from "../types";
import { createCmsOperations } from "./clients-operations";
import { createCmsKeyForSaleorItem } from "./metadata";
import * as Settings from "./settings";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

const mockedContext: Pick<WebhookContext, "authData"> = {
  authData: {
    saleorApiUrl: "https://domain.saleor.io/graphql/",
    token: "token",
    appId: "appId",
    domain: "domain.saleor.io",
  },
};

const createMockedClient = () => ({} as Client);

vi.mock("../../metadata", () => ({
  createSettingsManager: () => ({}),
}));

describe("CMS Clients Operations", () => {
  it("should return no creation operations when no variant channels passed and no variant cms passed", async () => {
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
      client: createMockedClient(),
      productVariantChannels: [],
      productVariantCmsKeys: [],
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
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
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
      client: createMockedClient(),
      productVariantChannels: ["default-channel"],
      productVariantCmsKeys: [],
    });

    const operationsItem = cmsOperations[0];

    /**
     * Replace deep equal with single ones due to some strange errors in vite/jest.
     * Functions were not matched properly in deep object
     */
    expect(operationsItem.cmsProviderInstanceId).toBe("first-provider");
    expect(operationsItem.operationType).toBe("createProduct");
    expect(operationsItem.operations.createProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.deleteProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.updateProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.ping).toEqual(expect.any(Function));
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
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
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
      client: createMockedClient(),
      productVariantChannels: ["default-channel"],
      productVariantCmsKeys: [createCmsKeyForSaleorItem("first-provider")],
    });

    const operationsItem = cmsOperations[0];

    /**
     * Replace deep equal with single ones due to some strange errors in vite/jest.
     * Functions were not matched properly in deep object
     */
    expect(operationsItem.cmsProviderInstanceId).toBe("first-provider");
    expect(operationsItem.operationType).toBe("updateProduct");
    expect(operationsItem.operations.createProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.deleteProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.updateProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.ping).toEqual(expect.any(Function));
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
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "first-provider",
            providerName: "strapi",
          },
          "second-provider": {
            name: "Second provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
            id: "second-provider",
            providerName: "strapi",
          },
          "third-provider": {
            name: "Third provider",
            token: "token",
            baseUrl: "http://localhost:3000",
            contentTypeId: "contentTypeId",
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
      client: createMockedClient(),
      productVariantChannels: [],
      productVariantCmsKeys: [createCmsKeyForSaleorItem("first-provider")],
    });

    const operationsItem = cmsOperations[0];

    /**
     * Replace deep equal with single ones due to some strange errors in vite/jest.
     * Functions were not matched properly in deep object
     */
    expect(operationsItem.cmsProviderInstanceId).toBe("first-provider");
    expect(operationsItem.operationType).toBe("deleteProduct");
    expect(operationsItem.operations.createProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.deleteProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.updateProduct).toEqual(expect.any(Function));
    expect(operationsItem.operations.ping).toEqual(expect.any(Function));
  });
});
