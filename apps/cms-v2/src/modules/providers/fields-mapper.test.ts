import { describe, it, expect } from "vitest";
import { FieldsMapper } from "./fields-mapper";

describe("FieldsMapper", () => {
  it("Maps variant fields to configuration fields", () => {
    const mappedFields = FieldsMapper.mapProductVariantToConfigurationFields({
      configMapping: {
        channels: "channels",
        productId: "product-id",
        productName: "product-name",
        productSlug: "product-slug",
        variantId: "variant-id",
        variantName: "variant-name",
      },
      variant: {
        id: "aaa-bbb-ccc",
        name: "43",
        channelListings: [
          {
            channel: {
              id: "12345",
              slug: "default-channel",
            },
          },
        ],
        product: {
          id: "aaa-bbb-123",
          name: "Shoes",
          slug: "shoes",
        },
      },
    });

    expect(mappedFields).toEqual({
      "variant-name": "43",
      "product-id": "aaa-bbb-123",
      "product-name": "Shoes",
      "product-slug": "shoes",
      "variant-id": "aaa-bbb-ccc",
      channels: [
        {
          channel: {
            id: "12345",
            slug: "default-channel",
          },
        },
      ],
    });
  });
});
