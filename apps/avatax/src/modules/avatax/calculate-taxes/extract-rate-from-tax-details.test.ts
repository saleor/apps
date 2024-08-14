import { describe, expect, it } from "vitest";

import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { extractIntegerRateFromTaxDetails } from "./extract-integer-rate-from-tax-details";

describe("extractRateFromTaxDetails", () => {
  it("Sums rate from list of tax details (percentages)", () => {
    const mocks = new AvataxCalculateTaxesMockGenerator().generateResponse();

    expect(extractIntegerRateFromTaxDetails(mocks.lines![0]!.details!)).toEqual(8.6);
  });
});
