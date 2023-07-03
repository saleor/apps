import { describe, expect, it } from "vitest";
import { AvataxOrderCreatedMockGenerator } from "./avatax-order-created-mock-generator";
import { AvataxOrderCreatedPayloadTransformer } from "./avatax-order-created-payload-transformer";

const mockGenerator = new AvataxOrderCreatedMockGenerator();

const orderMock = mockGenerator.generateOrder();
const discountedOrderMock = mockGenerator.generateOrder({
  discounts: [
    {
      amount: {
        amount: 10,
      },
      id: "RGlzY291bnREaXNjb3VudDox",
    },
  ],
});

export const avataxConfigMock = mockGenerator.generateAvataxConfig();

describe("AvataxOrderCreatedPayloadTransformer", () => {
  it("returns lines with discounted: true when there are discounts", () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer();

    const payload = transformer.transform(discountedOrderMock, avataxConfigMock, []);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });
  it("returns lines with discounted: false when there are no discounts", () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer();
    const payload = transformer.transform(orderMock, avataxConfigMock, []);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === false);

    expect(check).toBe(true);
  });
});
