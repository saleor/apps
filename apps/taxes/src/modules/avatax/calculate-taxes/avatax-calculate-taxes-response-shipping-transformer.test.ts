import { describe, it, expect } from "vitest";
import { AvataxCalculateTaxesResponseShippingTransformer } from "./avatax-calculate-taxes-response-shipping-transformer";
import { transactionModelMocks } from "../maps/mocks";

const transformer = new AvataxCalculateTaxesResponseShippingTransformer();

describe("AvataxCalculateTaxesResponseShippingTransformer", () => {
  it("when shipping line is not present, returns 0s", () => {
    const shippingLine = transformer.transform(transactionModelMocks.noShippingLine);

    expect(shippingLine).toEqual({
      shipping_price_gross_amount: 0,
      shipping_price_net_amount: 0,
      shipping_tax_rate: 0,
    });
  });
  it("when shipping line is not taxable, returns line amount", () => {
    const nonTaxableShippingLine = transformer.transform(transactionModelMocks.nonTaxable);

    expect(nonTaxableShippingLine).toEqual({
      shipping_price_gross_amount: 77.51,
      shipping_price_net_amount: 77.51,
      shipping_tax_rate: 0,
    });
  });

  it("when shipping line is taxable and tax is included, returns calculated gross & net amounts", () => {
    const taxableShippingLine = transformer.transform(transactionModelMocks.taxable.taxIncluded);

    expect(taxableShippingLine).toEqual({
      shipping_price_gross_amount: 77.51,
      shipping_price_net_amount: 70.78,
      shipping_tax_rate: 0,
    });
  });

  it("when shipping line is taxable and tax is not included, returns calculated gross & net amounts", () => {
    const taxableShippingLine = transformer.transform(transactionModelMocks.taxable.taxNotIncluded);

    expect(taxableShippingLine).toEqual({
      shipping_price_gross_amount: 84.87,
      shipping_price_net_amount: 77.51,
      shipping_tax_rate: 0,
    });
  });
});
