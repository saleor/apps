import { describe, expect, it } from "vitest";
import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";
import { attributeArrayToValueString, getMappedAttributes } from "./attribute-mapping";

const productBase: GoogleFeedProductVariantFragment["product"] = {
  name: "Product",
  __typename: "Product",
  id: "product-id",
  category: {
    id: "cat-id",
    __typename: "Category",
    name: "Category Name",
    googleCategoryId: "1",
  },
  description: "Product description",
  seoDescription: "Seo description",
  slug: "product-slug",
  thumbnail: { __typename: "Image", url: "" },
  attributes: [
    {
      attribute: {
        id: "main-color",
      },
      values: [{ name: "Black" }],
    },
    {
      attribute: {
        id: "accent-color",
      },
      values: [{ name: "Red" }],
    },
    {
      attribute: {
        id: "size",
      },
      values: [{ name: "XL" }],
    },
    {
      attribute: {
        id: "pattern",
      },
      values: [{ name: "plain" }],
    },
  ],
};

const priceBase: GoogleFeedProductVariantFragment["pricing"] = {
  __typename: "VariantPricingInfo",
  price: {
    __typename: "TaxedMoney",
    gross: {
      __typename: "Money",
      amount: 1,
      currency: "USD",
    },
  },
};

describe("attribute-mapping", () => {
  describe("attributeArrayToValueString", () => {
    it("Return undefined, when no attributes", () => {
      expect(attributeArrayToValueString([])).toStrictEqual(undefined);
    });

    it("Return value, when attribute have value assigned", () => {
      expect(
        attributeArrayToValueString([
          {
            attribute: {
              id: "1",
            },
            values: [
              {
                name: "Red",
              },
            ],
          },
          {
            attribute: {
              id: "2",
            },
            values: [],
          },
        ]),
      ).toStrictEqual("Red");
    });

    it("Return all values, when attribute have multiple value assigned", () => {
      expect(
        attributeArrayToValueString([
          {
            attribute: {
              id: "1",
            },
            values: [
              {
                name: "Red",
              },
              {
                name: "Blue",
              },
            ],
          },
          {
            attribute: {
              id: "2",
            },
            values: [
              {
                name: "Yellow",
              },
            ],
          },
        ]),
      ).toStrictEqual("Red/Blue/Yellow");
    });
  });

  describe("getMappedAttributes", () => {
    it("Return undefined, when no mapping is passed", () => {
      expect(
        getMappedAttributes({
          variant: {
            id: "id1",
            __typename: "ProductVariant",
            sku: "sku1",
            quantityAvailable: 1,
            pricing: priceBase,
            name: "Product variant",
            product: productBase,
            attributes: [],
          },
        }),
      ).toStrictEqual(undefined);
    });

    it("Return empty values, when variant has no related attributes", () => {
      expect(
        getMappedAttributes({
          variant: {
            id: "id1",
            __typename: "ProductVariant",
            sku: "sku1",
            quantityAvailable: 1,
            pricing: priceBase,
            name: "Product variant",
            product: productBase,
            attributes: [],
          },
          attributeMapping: {
            brandAttributeIds: ["brand-id"],
            colorAttributeIds: ["color-id"],
            patternAttributeIds: ["pattern-id"],
            materialAttributeIds: ["material-id"],
            sizeAttributeIds: ["size-id"],
            gtinAttributeIds: ["gtin-id"],
          },
        }),
      ).toStrictEqual({
        material: undefined,
        color: undefined,
        size: undefined,
        brand: undefined,
        pattern: undefined,
        gtin: undefined,
      });
    });

    it("Return attribute values, when variant has attributes used by mapping", () => {
      expect(
        getMappedAttributes({
          variant: {
            id: "id1",
            __typename: "ProductVariant",
            sku: "sku1",
            quantityAvailable: 1,
            pricing: priceBase,
            name: "Product variant",
            product: productBase,
            attributes: [
              {
                attribute: {
                  id: "should be ignored",
                },
                values: [
                  {
                    name: "ignored",
                  },
                ],
              },
              {
                attribute: {
                  id: "brand-id",
                },
                values: [
                  {
                    name: "Saleor",
                  },
                ],
              },
              {
                attribute: {
                  id: "size-id",
                },
                values: [
                  {
                    name: "XL",
                  },
                ],
              },
              {
                attribute: {
                  id: "color-base-id",
                },
                values: [
                  {
                    name: "Red",
                  },
                ],
              },
              {
                attribute: {
                  id: "color-secondary-id",
                },
                values: [
                  {
                    name: "Black",
                  },
                ],
              },
              {
                attribute: {
                  id: "material-id",
                },
                values: [
                  {
                    name: "Cotton",
                  },
                ],
              },
              {
                attribute: {
                  id: "pattern-id",
                },
                values: [
                  {
                    name: "Plain",
                  },
                ],
              },
              {
                attribute: {
                  id: "gtin-id",
                },
                values: [
                  {
                    name: "01234500001-0",
                  },
                ],
              },
            ],
          },
          attributeMapping: {
            brandAttributeIds: ["brand-id"],
            colorAttributeIds: ["color-base-id", "color-secondary-id"],
            materialAttributeIds: ["material-id"],
            sizeAttributeIds: ["size-id"],
            patternAttributeIds: ["pattern-id"],
            gtinAttributeIds: ["gtin-id"],
          },
        }),
      ).toStrictEqual({
        material: "Cotton",
        color: "Red/Black",
        size: "XL",
        brand: "Saleor",
        pattern: "Plain",
        gtin: "01234500001-0",
      });
    });
  });
});
