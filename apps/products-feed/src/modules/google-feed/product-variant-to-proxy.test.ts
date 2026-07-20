import { describe, expect, it } from "vitest";

import { type RootConfig } from "../app-configuration/app-config";
import { type ProductVariant } from "./fetch-product-data";
import { productVariantToProxy } from "./product-variant-to-proxy";

const productBase: ProductVariant["product"] = {
  name: "Product",
  __typename: "Product",
  id: "product-id",
  category: {
    id: "cat-id",
    __typename: "Category",
    name: "Category Name",
    googleCategoryId: "1",
  },
  productType: {
    isShippingRequired: true,
  },
  description: "Product description",
  seoDescription: "Seo description",
  slug: "product-slug",
  thumbnail: { __typename: "Image", url: "" },
  attributes: [
    {
      attribute: { id: "gtin-attr" },
      values: [{ name: "mapped-gtin-value" }],
    },
  ],
};

const priceBase: ProductVariant["pricing"] = {
  __typename: "VariantPricingInfo",
  price: {
    __typename: "TaxedMoney",
    gross: { __typename: "Money", amount: 1, currency: "USD" },
  },
};

const baseMapping: RootConfig["attributeMapping"] = {
  brandAttributeIds: [],
  colorAttributeIds: [],
  patternAttributeIds: [],
  materialAttributeIds: [],
  sizeAttributeIds: [],
  gtinAttributeIds: [],
  shippingLabelAttributeIds: [],
  useSkuAsGtin: false,
};

const buildVariant = (overrides?: Partial<ProductVariant>): ProductVariant => ({
  id: "variant-id",
  __typename: "ProductVariant",
  sku: "SKU-123",
  quantityAvailable: 1,
  pricing: priceBase,
  name: "Variant",
  product: productBase,
  attributes: [],
  ...overrides,
});

const findGtin = (item: { [key: string]: unknown }[]) => item.find((entry) => "g:gtin" in entry);

const run = (variant: ProductVariant, attributeMapping: RootConfig["attributeMapping"]) =>
  productVariantToProxy({
    variant,
    titleTemplate: "{{variant.product.name}}",
    productStorefrontUrl: "https://example.com/product",
    attributeMapping,
  });

describe("productVariantToProxy — GTIN resolution", () => {
  it("uses the mapped GTIN attribute value even when useSkuAsGtin is on", () => {
    const result = run(buildVariant(), {
      ...baseMapping,
      gtinAttributeIds: ["gtin-attr"],
      useSkuAsGtin: true,
    });

    expect(findGtin(result.item)).toStrictEqual({
      "g:gtin": [{ "#text": "mapped-gtin-value" }],
    });
  });

  it("falls back to SKU when no GTIN attribute is mapped and useSkuAsGtin is on", () => {
    const result = run(buildVariant(), {
      ...baseMapping,
      useSkuAsGtin: true,
    });

    expect(findGtin(result.item)).toStrictEqual({
      "g:gtin": [{ "#text": "SKU-123" }],
    });
  });

  it("omits GTIN when useSkuAsGtin is on but the variant has no SKU", () => {
    const result = run(buildVariant({ sku: null }), {
      ...baseMapping,
      useSkuAsGtin: true,
    });

    expect(findGtin(result.item)).toBeUndefined();
  });

  it("does not use SKU when useSkuAsGtin is off (regression)", () => {
    const result = run(buildVariant(), {
      ...baseMapping,
      useSkuAsGtin: false,
    });

    expect(findGtin(result.item)).toBeUndefined();
  });

  it("falls through to SKU when mapped GTIN attribute is an empty string", () => {
    const productWithEmptyGtin: ProductVariant["product"] = {
      ...productBase,
      attributes: [
        {
          attribute: { id: "gtin-attr" },
          values: [{ name: "" }],
        },
      ],
    };

    const result = run(buildVariant({ product: productWithEmptyGtin }), {
      ...baseMapping,
      gtinAttributeIds: ["gtin-attr"],
      useSkuAsGtin: true,
    });

    expect(findGtin(result.item)).toStrictEqual({
      "g:gtin": [{ "#text": "SKU-123" }],
    });
  });

  it("omits GTIN when useSkuAsGtin is on but the SKU is an empty string", () => {
    const result = run(buildVariant({ sku: "" }), {
      ...baseMapping,
      useSkuAsGtin: true,
    });

    expect(findGtin(result.item)).toBeUndefined();
  });
});
