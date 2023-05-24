import { describe, it, expect } from "vitest";
import { TaxJarCalculateTaxesResponseTransformer } from "./taxjar-calculate-taxes-response-transformer";
import { taxJarMockFactory } from "../taxjar-mock-factory";

const transformer = new TaxJarCalculateTaxesResponseTransformer();

describe("TaxJarCalculateTaxesResponseTransformer", () => {
  it("throws expected error when nexus is not found", () => {
    const noNexusResponse = taxJarMockFactory.createTaxForOrderMock("with_no_nexus");

    expect(() => transformer.transform(noNexusResponse)).toThrowError(
      "The company has no nexus in the state where the customer is located"
    );
  });
  it("transforms response when nexus is found", () => {
    const nexusResponse = taxJarMockFactory.createTaxForOrderMock("with_nexus");

    const result = transformer.transform(nexusResponse);

    expect(result).toEqual({
      shipping_price_net_amount: 10,
      shipping_price_gross_amount: 10.84,
      shipping_tax_rate: 0.08375,
      lines: [
        {
          total_gross_amount: 20.82,
          total_net_amount: 19.95,
          tax_rate: 0.04375,
        },
      ],
    });
  });
});
