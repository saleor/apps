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
  // We don't use global constant here so if someone changes default tax id in the future, this test will fail
  const CURRENT_DEFAULT_AVATAX_TAX_CLASS_ID = "P0000000";

  it("should return default tax class id if Saleor tax class is not found in tax classes from AvaTax", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "non-existing",
        matches: [match],
      }),
    ).toEqual(CURRENT_DEFAULT_AVATAX_TAX_CLASS_ID);
  });

  it("should return tax code if Saleor tax class is found in AvaTax tax classes", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "tax-class-id",
        matches: [match],
      }),
    ).toEqual("P2137");
  });

  it("should return default tax class id if there are no AvaTax tax classes", () => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    expect(
      matcher.match({
        taxClassId: "tax-class-id",
        matches: [],
      }),
    ).toEqual(CURRENT_DEFAULT_AVATAX_TAX_CLASS_ID);
  });
});
