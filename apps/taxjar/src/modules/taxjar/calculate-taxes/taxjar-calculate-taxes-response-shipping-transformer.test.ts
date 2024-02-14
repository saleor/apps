import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";

const transformer = new TaxJarCalculateTaxesResponseShippingTransformer();

describe("TaxJarCalculateTaxesResponseShippingTransformer", () => {
  it("returns shipping with taxes", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const response = mockGenerator.generateResponse();
    const taxBase = mockGenerator.generateTaxBase();
    const result = transformer.transform(taxBase, response);

    expect(result).toEqual({
      shipping_price_gross_amount: 59.17,
      shipping_price_net_amount: 54.21,
      shipping_tax_rate: 0.08375,
    });
  });
  it("returns no taxes when shipping not taxable", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const response = mockGenerator.generateResponse();
    const payload = mockGenerator.generateTaxBase();

    response.tax.breakdown!.shipping = undefined;
    response.tax.freight_taxable = false;

    const result = transformer.transform(payload, response);

    expect(result).toEqual({
      shipping_price_net_amount: 59.17,
      shipping_price_gross_amount: 59.17,
      shipping_tax_rate: 0,
    });
  });
  it("returns gross amount reduced by tax when pricesEnteredWithTax = true", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const response = mockGenerator.generateResponse();
    const payload = mockGenerator.generateTaxBase();

    const result = transformer.transform(payload, response);

    expect(result).toEqual({
      shipping_price_gross_amount: 59.17,
      shipping_price_net_amount: 54.21,
      shipping_tax_rate: 0.08375,
    });
  });
  it("returns gross amount when pricesEnteredWithTax = false", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_excluded");
    const response = mockGenerator.generateResponse();
    const payload = mockGenerator.generateTaxBase();

    const result = transformer.transform(payload, response);

    expect(result).toEqual({
      shipping_price_gross_amount: 64.13,
      shipping_price_net_amount: 59.17,
      shipping_tax_rate: 0.08375,
    });
  });
});
