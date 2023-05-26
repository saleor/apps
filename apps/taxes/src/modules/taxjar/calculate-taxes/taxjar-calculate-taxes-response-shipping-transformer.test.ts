import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";

const transformer = new TaxJarCalculateTaxesResponseShippingTransformer();

describe("TaxJarCalculateTaxesResponseShippingTransformer", () => {
  it("returns shipping with taxes", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus");
    const response = mockGenerator.generateResponse();
    const result = transformer.transform(response);

    expect(result).toEqual({
      shipping_price_net_amount: 48.33,
      shipping_price_gross_amount: 52.38,
      shipping_tax_rate: 0.08375,
    });
  });
  it("returns no taxes when shipping not found", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus");
    const response = mockGenerator.generateResponse();

    response.tax.breakdown!.shipping = undefined;
    response.tax.freight_taxable = false;

    const result = transformer.transform(response);

    expect(result).toEqual({
      shipping_price_net_amount: 48.33,
      shipping_price_gross_amount: 48.33,
      shipping_tax_rate: 0,
    });
  });
});
