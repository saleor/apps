import { describe, it, expect } from "vitest";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";
import { taxJarMockFactory } from "../taxjar-mock-factory";

const transformer = new TaxJarCalculateTaxesResponseShippingTransformer();

describe("TaxJarCalculateTaxesResponseShippingTransformer", () => {
  it("transforms shipping", () => {
    const response = taxJarMockFactory.createTaxForOrderMock("with_nexus");
    const result = transformer.transform(response);

    expect(result).toEqual({
      shipping_price_net_amount: 10,
      shipping_price_gross_amount: 10.84,
      shipping_tax_rate: 0.08375,
    });
  });
  it("returns 0s when shipping not found", () => {
    const response = taxJarMockFactory.createTaxForOrderMock("with_nexus");

    response.tax.breakdown!.shipping = undefined;

    const result = transformer.transform(response);

    expect(result).toEqual({
      shipping_price_net_amount: 0,
      shipping_price_gross_amount: 0,
      shipping_tax_rate: 0,
    });
  });
});
