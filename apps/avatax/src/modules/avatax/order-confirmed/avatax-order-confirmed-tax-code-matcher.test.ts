import { describe, expect, it } from "vitest";
import { AvataxOrderConfirmedTaxCodeMatcher } from "./avatax-order-confirmed-tax-code-matcher";

const match = {
  data: {
    saleorTaxClassId: "tax-class-id",
    avataxTaxCode: "P2137",
  },
  id: "id-1",
};

describe("AvataxOrderConfirmedTaxCodeMatcher", () => {
  it("should return default tax class id if Saleor tax class is not found in tax classes from Avatax", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "non-existing",
        matches: [match],
      }),
    ).toEqual("P0000000");
  });

  it("should return tax code if Saleor tax class is found in Avatax tax classes", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "tax-class-id",
        matches: [match],
      }),
    ).toEqual("P2137");
  });

  it("should return default tax class id if there are no Avatax tax classes", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "tax-class-id",
        matches: [],
      }),
    ).toEqual("P0000000");
  });
});
