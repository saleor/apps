import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";

describe("TaxJarCalculateTaxesPayloadTransformer", () => {
  const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
  const providerConfig = mockGenerator.generateProviderConfig();
  const transformer = new TaxJarCalculateTaxesPayloadTransformer(providerConfig);

  it("returns payload containing line_items without discounts", () => {
    const taxBase = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const transformedPayload = transformer.transform(taxBase, matchesMock);

    expect(transformedPayload).toEqual({
      params: {
        from_country: "US",
        from_zip: "10118",
        from_state: "NY",
        from_city: "New York",
        from_street: "350 5th Avenue",
        to_country: "US",
        to_zip: "10541",
        to_state: "NY",
        to_city: "MAHOPAC",
        to_street: "668 Route Six",
        shipping: 59.17,
        line_items: [
          {
            id: "T3JkZXJMaW5lOmM5MTUxMDljLTBkMzEtNDg2Yy05OGFmLTQ5NDM0MWY4NTNjYw==",
            quantity: 3,
            unit_price: 20,
            discount: 0,
            product_tax_code: "P0000000",
          },
          {
            id: "T3JkZXJMaW5lOjUxZDc2ZDY1LTFhYTgtNGEzMi1hNWJhLTJkZDMzNjVhZDhlZQ==",
            quantity: 1,
            unit_price: 20,
            discount: 0,
            product_tax_code: "",
          },
          {
            discount: 0,
            id: "T3JkZXJMaW5lOjlhMGJjZDhmLWFiMGQtNDJhOC04NTBhLTEyYjQ2YjJiNGIyZg==",
            product_tax_code: "",
            quantity: 2,
            unit_price: 50,
          },
        ],
      },
    });
  });
  it("returns payload containing line_items with discounts", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const taxBase = mockGenerator.generateTaxBase({
      discounts: [
        {
          amount: { amount: 10 },
        },
      ],
    });
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const transformedPayload = transformer.transform(taxBase, matchesMock);

    const payloadLines = transformedPayload.params.line_items ?? [];
    const discountSum = payloadLines.reduce((sum, line) => sum + (line.discount ?? 0), 0);

    expect(transformedPayload.params.line_items).toEqual([
      {
        id: "T3JkZXJMaW5lOmM5MTUxMDljLTBkMzEtNDg2Yy05OGFmLTQ5NDM0MWY4NTNjYw==",
        quantity: 3,
        unit_price: 20,
        discount: 3.33,
        product_tax_code: "P0000000",
      },
      {
        id: "T3JkZXJMaW5lOjUxZDc2ZDY1LTFhYTgtNGEzMi1hNWJhLTJkZDMzNjVhZDhlZQ==",
        quantity: 1,
        unit_price: 20,
        discount: 1.11,
        product_tax_code: "",
      },
      {
        discount: 5.56,
        id: "T3JkZXJMaW5lOjlhMGJjZDhmLWFiMGQtNDJhOC04NTBhLTEyYjQ2YjJiNGIyZg==",
        product_tax_code: "",
        quantity: 2,
        unit_price: 50,
      },
    ]);

    expect(discountSum).toEqual(10);
  });
  it("throws error when no address", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus_tax_included");
    const taxBase = mockGenerator.generateTaxBase({ address: null });
    const matchesMock = mockGenerator.generateTaxCodeMatches();

    expect(() => transformer.transform(taxBase, matchesMock)).toThrow(
      "Customer address is required to calculate taxes in TaxJar."
    );
  });
});
