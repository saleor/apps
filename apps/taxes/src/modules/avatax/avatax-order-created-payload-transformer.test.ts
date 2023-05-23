import { describe, expect, it } from "vitest";
import { taxMockFactory } from "../taxes/tax-mock-factory";
import { Payload } from "./avatax-order-created-adapter";
import {
  AvataxOrderCreatedPayloadTransformer,
  mapDiscounts,
  mapLines,
} from "./avatax-order-created-payload-transformer";
import { avataxMockFactory } from "./maps/avatax-mock-factory";

const MOCKED_ARGS: Payload = {
  order: taxMockFactory.createMockOrder(),
  channelConfig: avataxMockFactory.createMockChannelConfig(),
  config: avataxMockFactory.createMockAvataxConfig(),
};

describe("AvataxOrderCreatedPayloadTransformer", () => {
  it("returns lines with discounted: true when there are discounts", () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer();
    const payload = transformer.transform(MOCKED_ARGS);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });
});

describe("mapLines", () => {
  const lines = mapLines(MOCKED_ARGS.order, MOCKED_ARGS.config);

  it("returns the correct number of lines", () => {
    expect(lines).toHaveLength(3);
  });

  it("includes shipping as a line", () => {
    expect(lines).toContainEqual({
      itemCode: "Shipping",
      taxCode: MOCKED_ARGS.config.shippingTaxCode,
      quantity: 1,
      amount: 48.33,
      taxIncluded: true,
    });
  });

  it("includes products as lines", () => {
    const [first, second] = lines;

    expect(first).toContain({
      itemCode: "328223581",
      description: "Monospace Tee",
      quantity: 3,
      amount: 278.55,
    });
    expect(second).toContain({
      itemCode: "328223580",
      description: "Polyspace Tee",
      quantity: 1,
      amount: 49.28,
    });
  });
});
describe("mapDiscounts", () => {
  it("sums up all discounts", () => {
    const discounts = mapDiscounts(MOCKED_ARGS.order.discounts);

    expect(discounts).toEqual(31.45);
  });

  it("returns 0 if there are no discounts", () => {
    const discounts = mapDiscounts([]);

    expect(discounts).toEqual(0);
  });
});
