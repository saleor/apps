import { describe, expect, vi, it, beforeEach } from "vitest";
import {
  ContentfulClientStrip,
  ContentfulWebhooksProcessor,
} from "./contentful-webhooks-processor";
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

const mockContentfulClient: ContentfulClientStrip = {
  deleteProductVariant: vi.fn(),
  upsertProductVariant: vi.fn(),
};

describe("ContentfulWebhooksProcessor", () => {
  let processor: ContentfulWebhooksProcessor;

  beforeEach(() => {
    vi.clearAllMocks();

    processor = new ContentfulWebhooksProcessor(
      getMockContenfulConfiguration(),
      () => mockContentfulClient
    );
  });

  it("onProductVariantUpdated calls client upsert method", () => {
    const mockProductVariant = getMockWebhookProductVariant();

    processor.onProductVariantUpdated(mockProductVariant);

    expect(mockContentfulClient.upsertProductVariant).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: getMockContenfulConfiguration(),
        variant: mockProductVariant,
      })
    );
  });

  it("onProductVariantCreated calls client upsert method", () => {
    const mockProductVariant = getMockWebhookProductVariant();

    processor.onProductVariantCreated(mockProductVariant);

    expect(mockContentfulClient.upsertProductVariant).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: getMockContenfulConfiguration(),
        variant: mockProductVariant,
      })
    );
  });

  it("onProductVariantDeleted calls client delete method", () => {
    const mockProductVariant = getMockWebhookProductVariant();

    processor.onProductVariantDeleted(mockProductVariant);

    expect(mockContentfulClient.deleteProductVariant).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: getMockContenfulConfiguration(),
        variant: mockProductVariant,
      })
    );
  });

  it("onProductUpdated calls client upsert method for every product variant", () => {
    const mockProductVariant1 = getMockWebhookProductVariant();
    const mockProductVariant2 = getMockWebhookProductVariant();
    const mockProductVariant3 = getMockWebhookProductVariant();

    mockProductVariant1.id = "test-product-variant-id-1";
    mockProductVariant2.id = "test-product-variant-id-2";
    mockProductVariant3.id = "test-product-variant-id-3";

    processor.onProductUpdated({
      id: "test-product-id",
      name: "test-product-name",
      slug: "test-product-slug",
      variants: [mockProductVariant1, mockProductVariant2, mockProductVariant3],
      channelListings: [
        {
          channel: { id: "test-channel-id", slug: "test-channel-slug" },
          id: "test-id",
        },
      ],
    });

    expect(mockContentfulClient.upsertProductVariant).toHaveBeenCalledTimes(3);
  });
});
