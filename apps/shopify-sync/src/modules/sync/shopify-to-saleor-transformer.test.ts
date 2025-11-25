import { describe, expect, it } from "vitest";

import { ShopifyProduct } from "@/modules/shopify/types";

import {
  transformShopifyProductsToSaleor,
  transformShopifyProductToSaleor,
} from "./shopify-to-saleor-transformer";

const createMockShopifyProduct = (overrides: Partial<ShopifyProduct> = {}): ShopifyProduct => ({
  id: "gid://shopify/Product/123456",
  title: "Test Product",
  handle: "test-product",
  descriptionHtml: "<p>Test description</p>",
  vendor: "Test Vendor",
  productType: "T-Shirts",
  status: "ACTIVE",
  tags: ["tag1", "tag2"],
  options: [
    {
      id: "gid://shopify/ProductOption/1",
      name: "Size",
      position: 1,
      values: ["Small", "Medium", "Large"],
    },
    {
      id: "gid://shopify/ProductOption/2",
      name: "Color",
      position: 2,
      values: ["Red", "Blue"],
    },
  ],
  images: {
    edges: [
      {
        node: {
          id: "gid://shopify/Image/1",
          url: "https://example.com/image1.jpg",
          altText: "Product image",
          width: 800,
          height: 600,
        },
      },
    ],
  },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/111",
          title: "Small / Red",
          sku: "TSH-SM-RD",
          barcode: "123456789",
          price: "29.99",
          compareAtPrice: "39.99",
          weight: 0.5,
          weightUnit: "KILOGRAMS",
          inventoryQuantity: 100,
          inventoryItem: {
            id: "gid://shopify/InventoryItem/111",
            sku: "TSH-SM-RD",
            tracked: true,
          },
          selectedOptions: [
            { name: "Size", value: "Small" },
            { name: "Color", value: "Red" },
          ],
          image: null,
          metafields: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Metafield/1",
                  namespace: "custom",
                  key: "material",
                  value: "Cotton",
                  type: "single_line_text_field",
                },
              },
            ],
          },
        },
      },
    ],
  },
  metafields: {
    edges: [
      {
        node: {
          id: "gid://shopify/Metafield/2",
          namespace: "custom",
          key: "brand",
          value: "TestBrand",
          type: "single_line_text_field",
        },
      },
    ],
  },
  collections: {
    edges: [
      {
        node: {
          id: "gid://shopify/Collection/1",
          title: "Summer Collection",
          handle: "summer-collection",
          description: "Summer products",
          image: null,
        },
      },
    ],
  },
  ...overrides,
});

describe("transformShopifyProductToSaleor", () => {
  it("should transform basic product properties", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.name).toBe("Test Product");
    expect(result.slug).toBe("test-product");
    expect(result.description).toBe("<p>Test description</p>");
    expect(result.productTypeName).toBe("T-Shirts");
    expect(result.shopifyId).toBe("123456");
  });

  it("should transform product options", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.options).toHaveLength(2);
    expect(result.options[0]).toStrictEqual({
      name: "Size",
      values: ["Small", "Medium", "Large"],
    });
    expect(result.options[1]).toStrictEqual({
      name: "Color",
      values: ["Red", "Blue"],
    });
  });

  it("should transform product images", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.images).toHaveLength(1);
    expect(result.images[0]).toStrictEqual({
      url: "https://example.com/image1.jpg",
      alt: "Product image",
    });
  });

  it("should transform product metafields to metadata", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    const brandMeta = result.metadata.find((m) => m.key === "shopify_custom_brand");

    expect(brandMeta).toBeDefined();
    expect(brandMeta?.value).toBe("TestBrand");

    const shopifyIdMeta = result.metadata.find((m) => m.key === "shopify_product_id");

    expect(shopifyIdMeta).toBeDefined();
    expect(shopifyIdMeta?.value).toBe("123456");
  });

  it("should transform variants", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.variants).toHaveLength(1);
    const variant = result.variants[0];

    expect(variant.name).toBe("Small / Red");
    expect(variant.sku).toBe("TSH-SM-RD");
    expect(variant.price).toBe(29.99);
    expect(variant.compareAtPrice).toBe(39.99);
    expect(variant.weight).toBe(0.5);
    expect(variant.inventoryQuantity).toBe(100);
    expect(variant.shopifyId).toBe("111");
  });

  it("should transform variant options", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    const variant = result.variants[0];

    expect(variant.options).toHaveLength(2);
    expect(variant.options[0]).toStrictEqual({ name: "Size", value: "Small" });
    expect(variant.options[1]).toStrictEqual({ name: "Color", value: "Red" });
  });

  it("should transform collection names", () => {
    const shopifyProduct = createMockShopifyProduct();
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.collectionNames).toStrictEqual(["Summer Collection"]);
  });

  it("should use default product type name when not provided", () => {
    const shopifyProduct = createMockShopifyProduct({ productType: "" });
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.productTypeName).toBe("Default");
  });

  it("should handle products without metafields", () => {
    const shopifyProduct = createMockShopifyProduct({
      metafields: { edges: [] },
    });
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.metadata).toHaveLength(1);
    expect(result.metadata[0].key).toBe("shopify_product_id");
  });

  it("should handle products without images", () => {
    const shopifyProduct = createMockShopifyProduct({
      images: { edges: [] },
    });
    const result = transformShopifyProductToSaleor(shopifyProduct);

    expect(result.images).toHaveLength(0);
  });
});

describe("transformShopifyProductsToSaleor", () => {
  it("should transform multiple products", () => {
    const products = [
      createMockShopifyProduct({ id: "gid://shopify/Product/1", title: "Product 1" }),
      createMockShopifyProduct({ id: "gid://shopify/Product/2", title: "Product 2" }),
    ];

    const results = transformShopifyProductsToSaleor(products);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe("Product 1");
    expect(results[1].name).toBe("Product 2");
  });

  it("should return empty array for empty input", () => {
    const results = transformShopifyProductsToSaleor([]);

    expect(results).toHaveLength(0);
  });
});
