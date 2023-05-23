import { describe, it, expect } from "vitest";
import { AvataxCalculateTaxesResponseLinesTransformer } from "./avatax-calculate-taxes-response-lines-transformer";
import { transactionModelMocks } from "../mocks";

const transformer = new AvataxCalculateTaxesResponseLinesTransformer();

describe("AvataxCalculateTaxesResponseLinesTransformer", () => {
  it("when product lines are not taxable, returns line amount", () => {
    const nonTaxableProductLines = transformer.transform(transactionModelMocks.nonTaxable);

    expect(nonTaxableProductLines).toEqual([
      {
        total_gross_amount: 20,
        total_net_amount: 20,
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are taxable and tax is included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(transactionModelMocks.taxable.taxIncluded);

    expect(taxableProductLines).toEqual([
      {
        total_gross_amount: 40,
        total_net_amount: 36.53,
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are taxable and tax is not included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(transactionModelMocks.taxable.taxNotIncluded);

    expect(taxableProductLines).toEqual([
      {
        total_gross_amount: 43.8,
        total_net_amount: 40,
        tax_rate: 0,
      },
    ]);
  });
});
