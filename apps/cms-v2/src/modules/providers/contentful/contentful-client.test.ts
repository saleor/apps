import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentfulClient, ContentfulApiClientChunk } from "./contentful-client";
import { ContentfulProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";

const getMockContenfulConfiguration = (): ContentfulProviderConfig.FullShape => ({
  authToken: "test-token",
  configName: "test-config-name",
  contentId: "test-content-id",
  id: "test-id",
  spaceId: "test-space-id",
  type: "contentful",
  environment: "master",
  productVariantFieldsMapping: {
    channels: "channels",
    productId: "product-id",
    productName: "product-name",
    productSlug: "product-slug",
    variantId: "variant-id",
    variantName: "variant-name",
  },
});

const getMockWebhookProductVariant = (): WebhookProductVariantFragment => {
  return {
    id: "test-id",
    name: "test-name",
    product: {
      id: "test-product-id",
      name: "test-product-name",
      slug: "test-product-slug",
    },
    channelListings: [
      {
        channel: {
          id: "test-channel-id",
          slug: "test-channel-slug",
        },
        price: {
          amount: 100,
          currency: "USD",
        },
      },
    ],
  };
};

const mockGetSpace = vi.fn();
const mockGetEnvironment = vi.fn();
const mockGetEnvironments = vi.fn();
const mockGetEnvEntry = vi.fn();
const mockGetContentTypes = vi.fn();
const mockCreateEntry = vi.fn();
const mockGetEntries = vi.fn();

const mockContentfulSdk: ContentfulApiClientChunk = {
  getSpace: mockGetSpace.mockReturnValue(
    Promise.resolve({
      getEnvironment: mockGetEnvironment.mockReturnValue({
        getContentTypes: mockGetContentTypes.mockReturnValue({
          items: [{}],
        }),
        getEntry: mockGetEnvEntry.mockReturnValue({}),
        getEntries: mockGetEntries.mockReturnValue({
          items: [],
        }),
        createEntry: mockCreateEntry.mockReturnValue({}),
      }),
      getEnvironments: mockGetEnvironments.mockReturnValue({}),
    }),
  ),
};

describe("ContentfulClient", () => {
  let contentfulClient: ContentfulClient;

  beforeEach(() => {
    vi.clearAllMocks();

    contentfulClient = new ContentfulClient(
      {
        accessToken: "test-token",
        space: "test-space",
      },
      () => mockContentfulSdk,
    );
  });

  describe("getContentTypes", () => {
    it("Calls contentful SDK to fetch space->environment->contentTypes", async () => {
      await contentfulClient.getContentTypes("master");

      expect(mockGetContentTypes).toHaveBeenCalled();
    });
  });

  describe("getEnvironments", () => {
    it("Calls contentful SDK to fetch space->environments list", async () => {
      await contentfulClient.getEnvironments();

      expect(mockGetEnvironments).toHaveBeenCalled();
    });
  });

  describe("updateProductVariant", () => {
    it("Mutates the entry fields and calls update method", async () => {
      const mockEntry = {
        fields: {},
        update: vi.fn().mockReturnValue(Promise.resolve({})),
      };

      mockGetEnvEntry.mockReturnValue(mockEntry);
      mockGetEntries.mockReturnValue({ items: [mockEntry] });

      const mockConfig = getMockContenfulConfiguration();
      const mockMapping = mockConfig.productVariantFieldsMapping;

      const mockVariant = getMockWebhookProductVariant();

      await contentfulClient.updateProductVariant({
        configuration: mockConfig,
        variant: mockVariant,
      });

      /**
       * Query Contentful first, to get the entry. content_type is configured by user.
       * Then field path, matching variant id, also provided by user.
       */
      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: mockConfig.contentId,
        [`fields.${mockConfig.productVariantFieldsMapping.variantId}`]: mockVariant.id,
      });

      /**
       * Fields must reflect mapping config to variant real data
       *
       * App supports and hardcodes the locale to en-US now
       */
      expect(mockEntry.fields).toEqual({
        [mockMapping.productId]: {
          "en-US": mockVariant.product.id,
        },
        [mockMapping.productName]: {
          "en-US": mockVariant.product.name,
        },
        [mockMapping.productSlug]: {
          "en-US": mockVariant.product.slug,
        },
        [mockMapping.variantId]: {
          "en-US": mockVariant.id,
        },
        [mockMapping.variantName]: {
          "en-US": mockVariant.name,
        },
        [mockMapping.channels]: {
          "en-US": mockVariant.channelListings,
        },
      });

      expect(mockEntry.update).toHaveBeenCalled();
    });
  });

  describe("deleteProductVariant", () => {
    it("Calls contentful delete method on fetched entry", async () => {
      const mockEntry = {
        delete: vi.fn().mockReturnValue(Promise.resolve({})),
      };

      mockGetEnvEntry.mockReturnValue(mockEntry);
      mockGetEntries.mockReturnValue({ items: [mockEntry] });

      const mockConfig = getMockContenfulConfiguration();
      const mockVariant = getMockWebhookProductVariant();

      await contentfulClient.deleteProductVariant({
        configuration: mockConfig,
        variant: { id: mockVariant.id },
      });

      /**
       * Query Contentful first, to get the entry. content_type is configured by user.
       * Then field path, matching variant id, also provided by user.
       */
      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: mockConfig.contentId,
        [`fields.${mockConfig.productVariantFieldsMapping.variantId}`]: mockVariant.id,
      });
      expect(mockEntry.delete).toHaveBeenCalled();
    });
  });

  describe("uploadProductVariant", () => {
    it("Calls contentful createEntry method with correct mapped fields", async () => {
      const mockConfig = getMockContenfulConfiguration();
      const mockMapping = mockConfig.productVariantFieldsMapping;

      const mockVariant = getMockWebhookProductVariant();

      await contentfulClient.uploadProductVariant({
        configuration: mockConfig,
        variant: mockVariant,
      });

      expect(mockCreateEntry).toHaveBeenCalledWith(mockConfig.contentId, {
        fields: {
          [mockMapping.productId]: {
            "en-US": mockVariant.product.id,
          },
          [mockMapping.productName]: {
            "en-US": mockVariant.product.name,
          },
          [mockMapping.productSlug]: {
            "en-US": mockVariant.product.slug,
          },
          [mockMapping.variantId]: {
            "en-US": mockVariant.id,
          },
          [mockMapping.variantName]: {
            "en-US": mockVariant.name,
          },
          [mockMapping.channels]: {
            "en-US": mockVariant.channelListings,
          },
        },
      });
    });
  });

  describe("upsertProductVariant", () => {
    it("Calls standard create method on SDK if entry does not exist", async () => {
      const mockConfig = getMockContenfulConfiguration();
      const mockMapping = mockConfig.productVariantFieldsMapping;

      mockGetEnvEntry.mockReturnValue(undefined);
      mockGetEntries.mockReturnValue({ items: [] });

      const mockVariant = getMockWebhookProductVariant();

      await contentfulClient.upsertProductVariant({
        configuration: mockConfig,
        variant: mockVariant,
      });

      expect(mockGetEnvEntry).not.toHaveBeenCalled();
      expect(mockCreateEntry).toHaveBeenCalledWith(mockConfig.contentId, {
        fields: {
          [mockMapping.productId]: {
            "en-US": mockVariant.product.id,
          },
          [mockMapping.productName]: {
            "en-US": mockVariant.product.name,
          },
          [mockMapping.productSlug]: {
            "en-US": mockVariant.product.slug,
          },
          [mockMapping.variantId]: {
            "en-US": mockVariant.id,
          },
          [mockMapping.variantName]: {
            "en-US": mockVariant.name,
          },
          [mockMapping.channels]: {
            "en-US": mockVariant.channelListings,
          },
        },
      });
    });

    it("Calls update method if entries exist", async () => {
      const mockConfig = getMockContenfulConfiguration();
      const mockMapping = mockConfig.productVariantFieldsMapping;

      const mockVariant = getMockWebhookProductVariant();

      const mockEntry = {
        fields: {},
        update: vi.fn().mockReturnValue(Promise.resolve({})),
      };

      mockGetEnvEntry.mockReturnValue(mockEntry);
      mockGetEntries.mockReturnValue({ items: [mockEntry] });

      await contentfulClient.upsertProductVariant({
        configuration: mockConfig,
        variant: mockVariant,
      });

      // todo fix
      expect(mockEntry.fields).toEqual({
        [mockMapping.productId]: {
          "en-US": mockVariant.product.id,
        },
        [mockMapping.productName]: {
          "en-US": mockVariant.product.name,
        },
        [mockMapping.productSlug]: {
          "en-US": mockVariant.product.slug,
        },
        [mockMapping.variantId]: {
          "en-US": mockVariant.id,
        },
        [mockMapping.variantName]: {
          "en-US": mockVariant.name,
        },
        [mockMapping.channels]: {
          "en-US": mockVariant.channelListings,
        },
      });

      expect(mockEntry.update).toHaveBeenCalledWith();
    });
  });
});
