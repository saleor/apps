import { describe, it, expect } from "vitest";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { extractRateFromTaxDetails } from "./extract-rate-from-tax-details";

describe("extractRateFromTaxDetails", () => {
  it("Sums rate from list of tax details (percentages)", () => {
    const mocks = new AvataxCalculateTaxesMockGenerator().generateResponse();

    expect(extractRateFromTaxDetails(mocks.lines![0]!.details!)).toEqual(0.086);
  });
});
