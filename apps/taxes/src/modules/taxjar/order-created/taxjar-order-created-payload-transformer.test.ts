import { describe, expect, it } from "vitest";
import { TaxJarOrderCreatedMockGenerator } from "./taxjar-order-created-mock-generator";
import {
  TaxJarOrderCreatedPayloadTransformer,
  sumPayloadLines,
} from "./taxjar-order-created-payload-transformer";

const mockGenerator = new TaxJarOrderCreatedMockGenerator();

describe("TaxJarOrderCreatedPayloadTransformer", () => {
  it("returns the correct order amount", () => {
    const orderMock = mockGenerator.generateOrder();
    const providerConfig = mockGenerator.generateProviderConfig();
    const transformer = new TaxJarOrderCreatedPayloadTransformer();
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
