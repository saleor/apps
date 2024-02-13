import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { TaxJarCalculateTaxesResponseTransformer } from "./taxjar-calculate-taxes-response-transformer";

const transformer = new TaxJarCalculateTaxesResponseTransformer();

describe("TaxJarCalculateTaxesResponseTransformer", () => {
  it("returns values from payload if no nexus", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_no_nexus_tax_included");
    const noNexusResponseMock = mockGenerator.generateResponse();
    const payloadMock = {
      taxBase: mockGenerator.generateTaxBase(),
      providerConfig: mockGenerator.generateProviderConfig(),
    };

    const result = transformer.transform(payloadMock, noNexusResponseMock);

    expect(result).toEqual({
      shipping_price_net_amount: 59.17,
      shipping_price_gross_amount: 59.17,
      shipping_tax_rate: 0,
      lines: [
        {
          total_gross_amount: 60,
          total_net_amount: 60,
          tax_rate: 0,
        },
        {
          total_gross_amount: 20,
          total_net_amount: 20,
          tax_rate: 0,
        },
        {
          total_gross_amount: 100,
          total_net_amount: 100,
          tax_rate: 0,
        },
      ],
    });
  });
  it("transforms response when nexus is found", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const nexusResponse = mockGenerator.generateResponse();

    const payloadMock = {
      taxBase: mockGenerator.generateTaxBase(),
      providerConfig: mockGenerator.generateProviderConfig(),
    };

    const result = transformer.transform(payloadMock, nexusResponse);

    expect(result).toEqual({
      shipping_price_gross_amount: 59.17,
      shipping_price_net_amount: 54.21,
      shipping_tax_rate: 0.08375,
      lines: [
        {
          total_gross_amount: 20,
          total_net_amount: 18.32,
          tax_rate: 0.08375,
        },
        {
          total_gross_amount: 100,
          total_net_amount: 91.62,
          tax_rate: 0.08375,
        },
        {
          total_gross_amount: 60,
          total_net_amount: 54.97,
          tax_rate: 0.08375,
        },
      ],
    });
  });
});
