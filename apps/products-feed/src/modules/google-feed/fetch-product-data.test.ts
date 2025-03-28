import { Client } from "urql";
import { describe, expect, it, vi } from "vitest";

import {
  FetchBasicProductDataDocument,
  FetchProductAttributesDataDocument,
  FetchRelatedProductsDataDocument,
} from "../../../generated/graphql";
import { fetchProductData, getCursors } from "./fetch-product-data";

describe("getCursors", () => {
  it("loads cursor for each variant page", async () => {
    const client = {
      query: vi.fn().mockReturnValue({
        toPromise: vi
          .fn()
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-1",
                },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-2",
                },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: true,
                  endCursor: "cursor-3",
                },
              },
            },
          })
          .mockResolvedValue({
            data: {
              productVariants: {
                pageInfo: {
                  hasNextPage: false,
                  endCursor: "cursor-4",
                },
              },
            },
          }),
      }),
    } as unknown as Client;

    const cursors = await getCursors({
      client,
      channel: "channel-1",
    });

    expect(cursors).toStrictEqual(["cursor-1", "cursor-2", "cursor-3"]);
  });
});

describe("fetchProductData", () => {
  it("fetches product variants correctly", async () => {
    const client = {
      query: vi.fn().mockImplementation((document, { after }) => {
        const cursor = after || "";

        switch (document) {
          case FetchBasicProductDataDocument:
            return {
              toPromise: vi.fn().mockResolvedValueOnce({
                data: {
                  productVariants: {
                    edges: [
                      {
                        node: {
                          id: cursor + "variant-1",
                          name: "Variant 1",
                          product: { id: "product-1" },
                        },
                      },
                      {
                        node: {
                          id: cursor + "variant-2",
                          name: "Variant 2",
                          product: { id: "product-2" },
                        },
                      },
                    ],
                  },
                },
              }),
            };

          case FetchProductAttributesDataDocument:
            return {
              toPromise: vi.fn().mockResolvedValueOnce({
                data: {
                  productVariants: {
                    edges: [
                      {
                        node: {
                          id: cursor + "variant-1",
                          attributes: [{ id: "attr-1", name: "Color", value: "Red" }],
                        },
                      },
                      {
                        node: {
                          id: cursor + "variant-2",
                          attributes: [{ id: "attr-2", name: "Size", value: "M" }],
                        },
                      },
                    ],
                  },
                },
              }),
            };

          case FetchRelatedProductsDataDocument:
            return {
              toPromise: vi.fn().mockResolvedValueOnce({
                data: {
                  products: {
                    edges: [
                      { node: { id: "product-1", name: "Related Product 1" } },
                      { node: { id: "product-2", name: "Related Product 2" } },
                    ],
                  },
                },
              }),
            };

          default:
            return { toPromise: vi.fn().mockResolvedValue({ data: {} }) };
        }
      }),
    } as unknown as Client;

    const variants = await fetchProductData({
      client,
      channel: "channel-1",
      cursors: ["cursor-1", "cursor-2", "cursor-3"],
      imageSize: 100,
    });

    expect(variants).toStrictEqual([
      {
        attributes: [
          {
            id: "attr-1",
            name: "Color",
            value: "Red",
          },
        ],
        id: "variant-1",
        name: "Variant 1",
        product: {
          id: "product-1",
          name: "Related Product 1",
        },
      },
      {
        attributes: [
          {
            id: "attr-2",
            name: "Size",
            value: "M",
          },
        ],
        id: "variant-2",
        name: "Variant 2",
        product: {
          id: "product-2",
          name: "Related Product 2",
        },
      },
      {
        attributes: [
          {
            id: "attr-1",
            name: "Color",
            value: "Red",
          },
        ],
        id: "cursor-1variant-1",
        name: "Variant 1",
        product: {
          id: "product-1",
          name: "Related Product 1",
        },
      },
      {
        attributes: [
          {
            id: "attr-2",
            name: "Size",
            value: "M",
          },
        ],
        id: "cursor-1variant-2",
        name: "Variant 2",
        product: {
          id: "product-2",
          name: "Related Product 2",
        },
      },
      {
        attributes: [
          {
            id: "attr-1",
            name: "Color",
            value: "Red",
          },
        ],
        id: "cursor-2variant-1",
        name: "Variant 1",
        product: {
          id: "product-1",
          name: "Related Product 1",
        },
      },
      {
        attributes: [
          {
            id: "attr-2",
            name: "Size",
            value: "M",
          },
        ],
        id: "cursor-2variant-2",
        name: "Variant 2",
        product: {
          id: "product-2",
          name: "Related Product 2",
        },
      },
      {
        attributes: [
          {
            id: "attr-1",
            name: "Color",
            value: "Red",
          },
        ],
        id: "cursor-3variant-1",
        name: "Variant 1",
        product: {
          id: "product-1",
          name: "Related Product 1",
        },
      },
      {
        attributes: [
          {
            id: "attr-2",
            name: "Size",
            value: "M",
          },
        ],
        id: "cursor-3variant-2",
        name: "Variant 2",
        product: {
          id: "product-2",
          name: "Related Product 2",
        },
      },
    ]);
  });
});
