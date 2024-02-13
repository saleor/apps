import { describe, expect, it } from "vitest";
import { avataxMockFactory } from "../avatax-mock-factory";
import { AvataxCalculateTaxesResponseLinesTransformer } from "./avatax-calculate-taxes-response-lines-transformer";

const transformer = new AvataxCalculateTaxesResponseLinesTransformer();

const NON_TAXABLE_TRANSACTION_MOCK = avataxMockFactory.createMockTransaction("nonTaxable");
const TAX_INCLUDED_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxIncludedShipping");
const TAX_EXCLUDED_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxExcludedShipping");

describe("AvataxCalculateTaxesResponseLinesTransformer", () => {
  it("when product lines are not taxable, returns line amount", () => {
    const nonTaxableProductLines = transformer.transform(NON_TAXABLE_TRANSACTION_MOCK);

    expect(nonTaxableProductLines).toEqual([
      {
        total_gross_amount: 20,
        total_net_amount: 20,
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are taxable and tax is included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(TAX_INCLUDED_TRANSACTION_MOCK);

    expect(taxableProductLines).toEqual([
      {
        total_gross_amount: 40,
        total_net_amount: 36.53,
        tax_rate: 0,
      },
      {
        total_gross_amount: 40,
        total_net_amount: 36.53,
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are taxable and tax is not included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(TAX_EXCLUDED_TRANSACTION_MOCK);

    expect(taxableProductLines).toEqual([
      {
        total_gross_amount: 43.8,
        total_net_amount: 40,
        tax_rate: 0,
      },
      {
        total_gross_amount: 43.8,
        total_net_amount: 40,
        tax_rate: 0,
      },
    ]);
  });
});
