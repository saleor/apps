import { describe, expect, it } from "vitest";
import { AvataxOrderCreatedMockGenerator } from "./avatax-order-created-mock-generator";
import {
  AvataxOrderCreatedPayloadTransformer,
  mapLines,
} from "./avatax-order-created-payload-transformer";

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
const avataxConfigMock = mockGenerator.generateAvataxConfig();
const channelConfigMock = mockGenerator.generateChannelConfig();

describe("AvataxOrderCreatedPayloadTransformer", () => {
  it("returns lines with discounted: true when there are discounts", () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer(avataxConfigMock);
    const payloadMock = {
      order: discountedOrderMock,
      providerConfig: avataxConfigMock,
      channelConfig: channelConfigMock,
    };

    const payload = transformer.transform(payloadMock);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === true);

    expect(check).toBe(true);
  });
  it("returns lines with discounted: false when there are no discounts", () => {
    const transformer = new AvataxOrderCreatedPayloadTransformer(avataxConfigMock);
    const payloadMock = {
      order: orderMock,
      providerConfig: avataxConfigMock,
      channelConfig: channelConfigMock,
    };

    const payload = transformer.transform(payloadMock);

    const linesWithoutShipping = payload.model.lines.slice(0, -1);
    const check = linesWithoutShipping.every((line) => line.discounted === false);

    expect(check).toBe(true);
  });
});

describe("mapLines", () => {
  const lines = mapLines(orderMock, avataxConfigMock);

  it("returns the correct number of lines", () => {
    expect(lines).toHaveLength(4);
  });

  it("includes shipping as a line", () => {
    expect(lines).toContainEqual({
      itemCode: "Shipping",
      taxCode: "FR000000",
      quantity: 1,
      amount: 59.17,
      taxIncluded: true,
    });
  });

  it("includes products as lines", () => {
    const [first, second, third] = lines;

    expect(first).toContain({
      itemCode: "328223580",
      description: "Monospace Tee",
      quantity: 3,
      amount: 65.18,
    });
    expect(second).toContain({
      itemCode: "328223581",
      description: "Monospace Tee",
      quantity: 1,
      amount: 21.73,
    });
    expect(third).toContain({
      itemCode: "118223581",
      description: "Paul's Balance 420",
      quantity: 2,
      amount: 108.63,
    });
  });
});
