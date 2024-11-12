import { describe, expect, it } from "vitest";

import { AvataxProductLineFactory } from "./avatax-product-line-factory";

describe("AvataxProductLineFactory", () => {
  it("should create product line from Saleor checkout line", () => {
    const factory = new AvataxProductLineFactory();

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
    const factory = new AvataxProductLineFactory();

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
});
