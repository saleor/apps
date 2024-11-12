import { describe, expect, it } from "vitest";

import { AvataxProductLineCalculateTaxesFactory } from "./avatax-product-line-calculate-taxes-factory";

describe("AvataxProductLineFactory", () => {
  it("should create product line from Saleor checkout line", () => {
    const factory = new AvataxProductLineCalculateTaxesFactory();

    const avataxProductLine = factory.createFromSaleorLine({
      saleorLine: {
        quantity: 1,
        unitPrice: { amount: 100 },
        totalPrice: { amount: 100 },
        sourceLine: {
          __typename: "CheckoutLine",
          id: "52",
          checkoutProductVariant: {
            sku: "fromSKU",
            __typename: "ProductVariant",
            id: "123",
            product: {
              taxClass: {
                id: "taxClassId",
                name: "taxClassName",
              },
            },
          },
        },
      },
      taxIncluded: true,
      taxCode: "P00000",
      discounted: false,
    });

    expect(avataxProductLine).toEqual({
      amount: 100,
      discounted: false,
      itemCode: "fromSKU",
      quantity: 1,
      taxCode: "P00000",
      taxIncluded: true,
    });
  });

  it("should create product line from Saleor order line", () => {
    const factory = new AvataxProductLineCalculateTaxesFactory();

    const avataxProductLine = factory.createFromSaleorLine({
      saleorLine: {
        quantity: 1,
        unitPrice: { amount: 100 },
        totalPrice: { amount: 100 },
        sourceLine: {
          __typename: "OrderLine",
          id: "52",
          orderProductVariant: {
            __typename: "ProductVariant",
            id: "fromId",
            product: {
              taxClass: {
                id: "taxClassId",
                name: "taxClassName",
              },
            },
          },
        },
      },
      taxIncluded: true,
      taxCode: "P00000",
      discounted: false,
    });

    expect(avataxProductLine).toEqual({
      amount: 100,
      discounted: false,
      itemCode: "fromId",
      quantity: 1,
      taxCode: "P00000",
      taxIncluded: true,
    });
  });

  it("should throw error when source line type is not supported", () => {
    const factory = new AvataxProductLineCalculateTaxesFactory();

    expect(() =>
      factory.createFromSaleorLine({
        saleorLine: {
          quantity: 1,
          unitPrice: { amount: 100 },
          totalPrice: { amount: 100 },
          sourceLine: {
            // @ts-expect-error - for tests
            __typename: "NewLineType",
            id: "52",
            orderProductVariant: {
              __typename: "ProductVariant",
              id: "fromId",
              product: {
                taxClass: {
                  id: "taxClassId",
                  name: "taxClassName",
                },
              },
            },
          },
        },
        taxIncluded: true,
        taxCode: "P00000",
        discounted: false,
      }),
    ).toThrowError("Source line type NewLineType is not supported");
  });
});
