import { describe, expect, it } from "vitest";
import { avataxMockFactory } from "../avatax-mock-factory";
import { transformAvataxTransactionModelIntoShipping } from "./avatax-calculate-taxes-response-shipping-transformer";

const TAX_EXCLUDED_NO_SHIPPING_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxExcludedNoShipping");
const NON_TAXABLE_TRANSACTION_MOCK = avataxMockFactory.createMockTransaction("nonTaxable");
const TAX_INCLUDED_SHIPPING_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxIncludedShipping");
const TAX_EXCLUDED_SHIPPING_TRANSACTION_MOCK =
  avataxMockFactory.createMockTransaction("taxExcludedShipping");

describe("transformAvataxTransactionModelIntoShipping", () => {
  it("when shipping line is not present, returns 0s", () => {
    const shippingLine = transformAvataxTransactionModelIntoShipping(
      TAX_EXCLUDED_NO_SHIPPING_TRANSACTION_MOCK,
    );

    expect(shippingLine).toEqual({
      shipping_price_gross_amount: 0,
      shipping_price_net_amount: 0,
      shipping_tax_rate: 0,
    });
  });
  it("when shipping line is not taxable, returns line amount", () => {
    const nonTaxableShippingLine = transformAvataxTransactionModelIntoShipping(
      NON_TAXABLE_TRANSACTION_MOCK,
    );

    expect(nonTaxableShippingLine).toEqual({
      shipping_price_gross_amount: 77.51,
      shipping_price_net_amount: 77.51,
      shipping_tax_rate: 0,
    });
  });

  it("when shipping line is taxable and tax is included, returns calculated gross & net amounts", () => {
    const taxableShippingLine = transformAvataxTransactionModelIntoShipping(
      TAX_INCLUDED_SHIPPING_TRANSACTION_MOCK,
    );

    expect(taxableShippingLine).toEqual({
      shipping_price_gross_amount: 77.51,
      shipping_price_net_amount: 70.78,
      shipping_tax_rate: 0,
    });
  });

  it("when shipping line is taxable and tax is not included, returns calculated gross & net amounts", () => {
    const taxableShippingLine = transformAvataxTransactionModelIntoShipping(
      TAX_EXCLUDED_SHIPPING_TRANSACTION_MOCK,
    );

    expect(taxableShippingLine).toEqual({
      shipping_price_gross_amount: 84.87,
      shipping_price_net_amount: 77.51,
      shipping_tax_rate: 0,
    });
  });
});
