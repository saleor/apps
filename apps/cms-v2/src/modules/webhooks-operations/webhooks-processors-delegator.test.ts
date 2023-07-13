import { describe, vi, it, expect, beforeEach } from "vitest";
import { ProductWebhooksProcessor } from "./product-webhooks-processor";
import { WebhooksProcessorsDelegator } from "./webhooks-processors-delegator";
import { AppConfig, ContentfulProviderConfig, DatocmsProviderConfig } from "../configuration";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

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

const mockWebookProcessor: ProductWebhooksProcessor = {
  onProductUpdated: vi.fn(),
  onProductVariantCreated: vi.fn(),
  onProductVariantDeleted: vi.fn(),
  onProductVariantUpdated: vi.fn(),
};

const prepareFilledAppConfig = () => {
  const appConfig = new AppConfig();

  appConfig.providers.addProvider(getMockContentfulInput());
  appConfig.providers.addProvider(getMockDatocmsInput());

  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[0].id,
    channelSlug: "test",
    providerType: "contentful",
  });

  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[1].id,
    channelSlug: "test",
    providerType: "contentful",
  });

  /**
   * This one will be ignored by delegator for update and created, because mocks are set for slug "test"
   */
  appConfig.connections.addConnection({
    providerId: appConfig.providers.getProviders()[1].id,
    channelSlug: "test-2",
    providerType: "contentful",
  });

  return appConfig;
};

const getMockProductVariantWebhookFragment = (): WebhookProductVariantFragment => {
  return {
    id: "variant-id",
    name: "variant-name",
    product: {
      id: "product-id",
      name: "product-name",
      slug: "product-slug",
    },
    channelListings: [
      {
        channel: {
          id: "channel-id",
          slug: "test",
        },
      },
    ],
  };
};

describe("WebhooksProcessorsDelegator", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Variant Created Operations", () => {
    it("Calls processor CREATE method every for every connection that matches channel slug", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantCreatedOperations(getMockProductVariantWebhookFragment());

      expect(mockWebookProcessor.onProductVariantCreated).toHaveBeenCalledTimes(2);
    });
  });

  describe("Variant Updated Operations", () => {
    it("Calls processor UPDATE method every for every connection that matches channel slug", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantUpdatedOperations(getMockProductVariantWebhookFragment());

      expect(mockWebookProcessor.onProductVariantUpdated).toHaveBeenCalledTimes(2);
    });
  });

  describe("Variant Deleted Operations", () => {
    it("Calls processor DELETE method for every connection, even if channel slug does not match, so CMS is not left with orphans", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateVariantDeletedOperations(getMockProductVariantWebhookFragment());

      /**
       * Will be called 3 times
       */
      expect(mockWebookProcessor.onProductVariantDeleted).toHaveBeenCalledTimes(3);
    });
  });

  describe("Product Updated Operations", () => {
    it("Calls processor UPDATE PRODUCT method for every connection, even if channel slug does not match, so CMS is not left with orphans", async () => {
      const appConfig = prepareFilledAppConfig();

      const delegator = new WebhooksProcessorsDelegator({
        injectProcessorFactory: () => mockWebookProcessor,
        context: {
          connections: appConfig.connections.getConnections(),
          providers: appConfig.providers.getProviders(),
        },
      });

      await delegator.delegateProductUpdatedOperations({
        id: "product-id",
        name: "product-name",
        slug: "product-slug",
        channelListings: [
          {
            channel: {
              id: "channel-id",
              slug: "test",
            },
            id: "channel-listing-id",
          },
        ],
        variants: [
          {
            id: "variant-id",
            name: "variant-name",
          },
        ],
      });

      /**
       * Will be called 3 times
       */
      expect(mockWebookProcessor.onProductUpdated).toHaveBeenCalledTimes(3);
    });
  });
});
