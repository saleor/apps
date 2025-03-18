import { describe, expect, it } from "vitest";

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
        sku: "sku",
      },
      variant: {
        id: "aaa-bbb-ccc",
        name: "43",
        sku: "SHOE-43",
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

    expect(mappedFields).toStrictEqual({
      "variant-name": "43",
      "product-id": "aaa-bbb-123",
      "product-name": "Shoes",
      "product-slug": "shoes",
      "variant-id": "aaa-bbb-ccc",
      sku: "SHOE-43",
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
