import { describe, it, expect, beforeEach } from "vitest";
import { AppConfig } from "./app-config";
import { ContentfulProviderConfig } from "./schemas/contentful-provider.schema";
import { DatocmsProviderConfig } from "./schemas/datocms-provider.schema";

const getMockContentfulInput = (): ContentfulProviderConfig.InputShape => {
  return {
    configName: "Test",
    type: "contentful",
    contentId: "test",
    authToken: "test",
    environment: "test",
    productVariantFieldsMapping: {
      channels: "channels",
      productId: "productId",
      productName: "productName",
      productSlug: "productSlug",
      variantId: "variantId",
      variantName: "variantName",
    },
    spaceId: "test",
  };
};
const getMockDatocmsInput = (): DatocmsProviderConfig.InputShape => {
  return {
    configName: "Test",
    type: "datocms",
    itemType: "test",
    authToken: "test",
    productVariantFieldsMapping: {
      channels: "channels",
      productId: "productId",
      productName: "productName",
      productSlug: "productSlug",
      variantId: "variantId",
      variantName: "variantName",
    },
  };
};

describe("App Config", () => {
  let appConfig: AppConfig;

  beforeEach(() => {
    appConfig = new AppConfig();
  });

  it("Constructs with empty state", () => {
    expect(appConfig.connections.getConnections()).toEqual([]);
    expect(appConfig.providers.getProviders()).toEqual([]);
  });

  describe("Providers", () => {
    it("Can retrieve provider by ID from the config", () => {
      appConfig.providers.addProvider(getMockContentfulInput());

      const provider = appConfig.providers.getProviders()[0];

      expect(provider).toBeDefined();
      expect(appConfig.providers.checkProviderExists(provider.id)).toBe(true);
      expect(appConfig.providers.getProviderById(provider.id)).toBeDefined();
    });

    it("Can update the provider", () => {
      appConfig.providers.addProvider(getMockContentfulInput());

      const provider = appConfig.providers.getProviders()[0] as ContentfulProviderConfig.FullShape;

      appConfig.providers.updateProvider({
        ...provider,
        spaceId: "new-space-id",
      });

      const providerUpdated =
        appConfig.providers.getProviders()[0] as ContentfulProviderConfig.FullShape;

      expect(providerUpdated.spaceId).toBe("new-space-id");
    });

    it("Can delete provider", () => {
      appConfig.providers.addProvider(getMockContentfulInput());

      const provider = appConfig.providers.getProviders()[0];

      expect(provider).toBeDefined();

      appConfig.providers.deleteProvider(provider.id);

      expect(appConfig.providers.getProviders()).toEqual([]);
    });
  });

  describe("Connections", () => {
    it("Throws if trying to add connection with provider that doesn't exist", () => {
      expect(() => {
        appConfig.connections.addConnection({
          channelSlug: "test",
          providerId: "asdasd123",
          providerType: "contentful",
        });
      }).toThrow();
    });

    it("Can add connection with existing provider", () => {
      appConfig.providers.addProvider(getMockContentfulInput());

      appConfig.connections.addConnection({
        channelSlug: "test",
        providerId: appConfig.providers.getProviders()[0].id,
        providerType: "contentful",
      });

      expect(appConfig.connections.getConnections().length).toBe(1);
    });

    it("Removes all connections that include passed provider", () => {
      appConfig.providers.addProvider(getMockContentfulInput());
      appConfig.providers.addProvider(getMockDatocmsInput());

      appConfig.connections.addConnection({
        channelSlug: "test",
        providerId: appConfig.providers.getProviders()[0].id,
        providerType: "contentful",
      });

      appConfig.connections.addConnection({
        channelSlug: "test2",
        providerId: appConfig.providers.getProviders()[0].id,
        providerType: "contentful",
      });

      appConfig.connections.addConnection({
        channelSlug: "test2",
        providerId: appConfig.providers.getProviders()[1].id,
        providerType: "datocms",
      });

      expect(appConfig.connections.getConnections().length).toBe(3);

      appConfig.providers.deleteProvider(appConfig.providers.getProviders()[0].id);

      const leftConnections = appConfig.connections.getConnections();

      expect(leftConnections.length).toBe(1);
      expect(leftConnections[0].providerType).toBe("datocms");
    });
  });
});
