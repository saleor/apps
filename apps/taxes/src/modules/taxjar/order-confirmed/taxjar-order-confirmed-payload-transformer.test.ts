import { describe, expect, it } from "vitest";
import { TaxJarOrderConfirmedMockGenerator } from "./taxjar-order-confirmed-mock-generator";
import {
  TaxJarOrderConfirmedPayloadTransformer,
  sumPayloadLines,
} from "./taxjar-order-confirmed-payload-transformer";

const mockGenerator = new TaxJarOrderConfirmedMockGenerator();

describe("TaxJarOrderConfirmedPayloadTransformer", () => {
  it("returns the correct order amount", () => {
    const orderMock = mockGenerator.generateOrder();
    const providerConfig = mockGenerator.generateProviderConfig();
    const transformer = new TaxJarOrderConfirmedPayloadTransformer();
    const transformedPayload = transformer.transform(orderMock, providerConfig, []);

    expect(transformedPayload.params.amount).toBe(239.17);
  });
});

describe("sumPayloadLines", () => {
  it("returns the sum of all line items when items quantity = 1", () => {
    const result = sumPayloadLines([
      {
        quantity: 1,
        unit_price: 90.45,
        product_identifier: "328223581",
      },
      {
        quantity: 1,
        unit_price: 45.25,
        product_identifier: "328223580",
      },
    ]);

    expect(result).toBe(135.7);
  });
  it("returns the sum of all line items when items quantity > 1", () => {
    const result = sumPayloadLines([
      {
        quantity: 3,
        unit_price: 90.45,
        product_identifier: "328223581",
      },
      {
        quantity: 2,
        unit_price: 45.25,
        product_identifier: "328223580",
      },
      {
        quantity: 1,
        unit_price: 50.25,
        product_identifier: "328223580",
      },
    ]);

    expect(result).toBe(412.1);
  });
});
