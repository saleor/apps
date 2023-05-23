import { describe, expect, it } from "vitest";
import { taxJarMockFactory } from "../taxjar-mock-factory";
import {
  TaxJarOrderCreatedPayloadTransformer,
  sumPayloadLines,
} from "./taxjar-order-created-payload-transformer";
import { taxMockFactory } from "../../taxes/tax-mock-factory";

const MOCKED_PAYLOAD = {
  order: taxMockFactory.createOrderCreatedMock(),
  channelConfig: taxJarMockFactory.createMockChannelConfig(),
};

describe("TaxJarOrderCreatedPayloadTransformer", () => {
  it("returns the correct order amount", () => {
    const transformer = new TaxJarOrderCreatedPayloadTransformer();
    const transformedPayload = transformer.transform(MOCKED_PAYLOAD);

    expect(transformedPayload.params.amount).toBe(183.33);
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
