import { describe, expect, it } from "vitest";

import { avataxMockFactory } from "../avatax-mock-factory";
import { AvataxCalculateTaxesResponseLinesTransformer } from "./avatax-calculate-taxes-response-lines-transformer";

const transformer = new AvataxCalculateTaxesResponseLinesTransformer();

const TAXABLE_TRANSACTION_MOCK = avataxMockFactory.createMockTransaction("taxIncludedShipping");
const NON_TAXABLE_TRANSACTION_MOCK = avataxMockFactory.createMockTransaction("nonTaxable");
const NON_TAXABLE_TRANSACTION_MOCK_WITH_DISCOUNT =
  avataxMockFactory.createMockTransaction("nonTaxableWithDiscount");
const TAX_INCLUDED_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxIncludedShipping");
const TAX_EXCLUDED_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxExcludedShipping");

describe("AvataxCalculateTaxesResponseLinesTransformer", () => {
  it("when product lines are not taxable, returns line amount if discount is 0", () => {
    const nonTaxableProductLines = transformer.transform(NON_TAXABLE_TRANSACTION_MOCK);

    expect(nonTaxableProductLines).toStrictEqual([
      {
        total_gross_amount: 20,
        total_net_amount: 20,
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are not taxable, return line amount minus discount if discount is not 0", () => {
    const nonTaxableProductLines = transformer.transform(
      NON_TAXABLE_TRANSACTION_MOCK_WITH_DISCOUNT,
    );

    expect(nonTaxableProductLines).toStrictEqual([
      {
        total_gross_amount: 10,
        total_net_amount: 10,
        tax_rate: 0,
      },
    ]);
  });

  it('when product lines are not taxable, returns "0" for tax rate', () => {
    const nonTaxableProductLines = transformer.transform(
      NON_TAXABLE_TRANSACTION_MOCK_WITH_DISCOUNT,
    );

    expect(nonTaxableProductLines).toMatchObject([
      {
        tax_rate: 0,
      },
    ]);
  });

  it("when product lines are taxable and tax is included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(TAX_INCLUDED_TRANSACTION_MOCK);

    expect(taxableProductLines).toStrictEqual([
      {
        total_gross_amount: 40,
        total_net_amount: 36.53,
        tax_rate: 9.5,
      },
      {
        total_gross_amount: 40,
        total_net_amount: 36.53,
        tax_rate: 9.5,
      },
    ]);
  });

  it("when product lines are taxable and tax is not included, returns calculated gross & net amounts", () => {
    const taxableProductLines = transformer.transform(TAX_EXCLUDED_TRANSACTION_MOCK);

    expect(taxableProductLines).toStrictEqual([
      {
        total_gross_amount: 43.8,
        total_net_amount: 40,
        tax_rate: 9.5,
      },
      {
        total_gross_amount: 43.8,
        total_net_amount: 40,
        tax_rate: 9.5,
      },
    ]);
  });

  /**
   * AvaTax will return non-zero rate even if item is not taxable or there is some tax exemption.
   * That's why we overwrite the rate to be effectively zero too.
   */
  describe("GIVEN non-zero tax rate from AvaTax", () => {
    const transaction = structuredClone(TAXABLE_TRANSACTION_MOCK);

    // Assert only first line
    transaction.lines![0].details![0].rate = 0.1;

    describe("AND calculated tax from AvaTax is zero", () => {
      const localTransaction = structuredClone(transaction);

      localTransaction!.lines![0].taxCalculated = 0;

      it("Should return tax rate as zero", () => {
        const result = transformer.transform(localTransaction);

        expect(result[0].tax_rate).toBe(0);
      });
    });
    describe("AND taxableAmount from AvaTax is zero", () => {
      const localTransaction = structuredClone(transaction);

      localTransaction!.lines![0].taxableAmount = 0;

      it("Should return tax rate as zero", () => {
        const result = transformer.transform(localTransaction);

        expect(result[0].tax_rate).toBe(0);
      });
    });
  });
});
