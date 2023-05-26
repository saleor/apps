import { describe, expect, it } from "vitest";
import { TaxJarCalculateTaxesMockGenerator } from "./taxjar-calculate-taxes-mock-generator";
import { TaxJarCalculateTaxesPayloadTransformer } from "./taxjar-calculate-taxes-payload-transformer";

const transformer = new TaxJarCalculateTaxesPayloadTransformer();

describe("TaxJarCalculateTaxesPayloadTransformer", () => {
  it("returns payload containing line_items without discounts", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus");
    const taxBase = mockGenerator.generateTaxBase();
    const channelConfig = mockGenerator.generateChannelConfig();
    const transformedPayload = transformer.transform({
      taxBase,
      channelConfig,
    });

    expect(transformedPayload).toEqual({
      params: {
        from_country: "US",
        from_zip: "92093",
        from_state: "CA",
        from_city: "La Jolla",
        from_street: "9500 Gilman Drive",
        to_country: "US",
        to_zip: "94111",
        to_state: "CA",
        to_city: "SAN FRANCISCO",
        to_street: "600 Montgomery St",
        shipping: 48.33,
        line_items: [
          {
            id: "T3JkZXJMaW5lOjNmMjYwZmMyLTZjN2UtNGM5Ni1iYTMwLTEyMjAyODMzOTUyZA==",
            quantity: 3,
            unit_price: 20,
            discount: 0,
            product_tax_code: "",
          },
          {
            id: "T3JkZXJMaW5lOjNlNGZjODdkLTIyMmEtNDZiYi1iYzIzLWJiYWVkODVlOTQ4Mg==",
            quantity: 1,
            unit_price: 20,
            discount: 0,
            product_tax_code: "",
          },
          {
            discount: 0,
            id: "T3JkZXJMaW5lOmM2NTBhMzVkLWQ1YjQtNGRhNy1hMjNjLWEzODU4ZDE1MzI2Mw==",
            product_tax_code: "",
            quantity: 2,
            unit_price: 50,
          },
        ],
      },
    });
  });
  it("returns payload containing line_items with discounts", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus");
    const taxBase = mockGenerator.generateTaxBase({
      discounts: [
        {
          amount: { amount: 10 },
        },
      ],
    });
    const channelConfig = mockGenerator.generateChannelConfig();
    const transformedPayload = transformer.transform({
      taxBase,
      channelConfig,
    });

    const payloadLines = transformedPayload.params.line_items ?? [];
    const discountSum = payloadLines.reduce((sum, line) => sum + (line.discount ?? 0), 0);

    expect(transformedPayload.params.line_items).toEqual([
      {
        id: "T3JkZXJMaW5lOjNmMjYwZmMyLTZjN2UtNGM5Ni1iYTMwLTEyMjAyODMzOTUyZA==",
        quantity: 3,
        unit_price: 20,
        discount: 3.33,
        product_tax_code: "",
      },
      {
        id: "T3JkZXJMaW5lOjNlNGZjODdkLTIyMmEtNDZiYi1iYzIzLWJiYWVkODVlOTQ4Mg==",
        quantity: 1,
        unit_price: 20,
        discount: 1.11,
        product_tax_code: "",
      },
      {
        discount: 5.56,
        id: "T3JkZXJMaW5lOmM2NTBhMzVkLWQ1YjQtNGRhNy1hMjNjLWEzODU4ZDE1MzI2Mw==",
        product_tax_code: "",
        quantity: 2,
        unit_price: 50,
      },
    ]);

    expect(discountSum).toEqual(10);
  });
  it("throws error when no address", () => {
    const mockGenerator = new TaxJarCalculateTaxesMockGenerator("with_nexus");
    const taxBase = mockGenerator.generateTaxBase({ address: null });
    const channelConfig = mockGenerator.generateChannelConfig();

    expect(() =>
      transformer.transform({
        taxBase,
        channelConfig,
      })
    ).toThrow("Customer address is required to calculate taxes in TaxJar.");
  });
});
