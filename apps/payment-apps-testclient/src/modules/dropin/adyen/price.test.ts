import { describe, expect, it } from "vitest";

import { AdyenPrice, SaleorPrice } from "./price";

describe("SaleorPrice", () => {
  it("should create AdyenPrice with amounts in integers from SaleorPrice", () => {
    const saleorPrice = SaleorPrice.create({
      floatAmount: 100.11,
      currency: "USD",
    });
    const adyenPrice = saleorPrice.toAdyenPrice();

    expect(adyenPrice.getAmount()).toBe(10011);
  });
});

describe("AdyenPrice", () => {
  it("should create SaleorPrice with amounts in float from AdyenPrice", () => {
    const adyenPrice = AdyenPrice.create({
      integerAmount: 10011,
      currency: "USD",
    });
    const saleorPrice = adyenPrice.toSaleorPrice();

    expect(saleorPrice.getAmount()).toBe(100.11);
  });

  it("should throw an error when creating AdyenPrice with float as amount", () => {
    expect(() => AdyenPrice.create({ integerAmount: 10.011, currency: "USD" }))
      .toThrowErrorMatchingInlineSnapshot(`
        [ArgsParseError: ZodError: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": [
              "integerAmount"
            ]
          }
        ]
        Invalid arguments]
      `);
  });
});
