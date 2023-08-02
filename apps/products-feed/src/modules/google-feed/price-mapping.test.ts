import { describe, expect, it } from "vitest";
import { priceMapping } from "./price-mapping";

describe("priceMapping", () => {
  it("Return undefined, when no pricing available", () => {
    expect(
      priceMapping({
        pricing: undefined,
      })
    ).toStrictEqual(undefined);
  });
  it("Return undefined, when amount is equal to 0", () => {
    expect(
      priceMapping({
        pricing: {
          priceUndiscounted: {
            gross: {
              amount: 0,
              currency: "USD",
            },
          },
        },
      })
    ).toStrictEqual(undefined);
  });
  it("Return formatted base price, when there is no sale", () => {
    expect(
      priceMapping({
        pricing: {
          priceUndiscounted: {
            gross: {
              amount: 10.5,
              currency: "USD",
            },
          },
        },
      })
    ).toStrictEqual({ price: "10.50 USD" });
  });
  it("Return formatted base and sale prices, when there is a sale", () => {
    expect(
      priceMapping({
        pricing: {
          priceUndiscounted: {
            gross: {
              amount: 10.5,
              currency: "USD",
            },
          },
          price: {
            gross: {
              amount: 5.25,
              currency: "USD",
            },
          },
        },
      })
    ).toStrictEqual({ price: "10.50 USD", salePrice: "5.25 USD" });
  });
});
