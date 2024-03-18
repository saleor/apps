import { describe, expect, it } from "vitest";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";

const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const orderMock = mockGenerator.generateOrder();

const matches: AvataxTaxCodeMatches = [];

describe("AvataxOrderConfirmedPayloadLinesTransformer", () => {
  const lines = linesTransformer.transform(orderMock, avataxConfigMock, matches);
  const [first, second, third, shipping] = lines;

  it("returns the correct number of lines", () => {
    expect(lines).toHaveLength(4);
  });

  it("includes shipping as a line", () => {
    expect(shipping).toEqual({
      itemCode: "Shipping",
      taxCode: "FR000000",
      quantity: 1,
      amount: 59.17,
      taxIncluded: true,
      discounted: false,
    });
  });

  it("includes products as lines", () => {
    expect(first).toEqual({
      itemCode: "328223580",
      discounted: false,
      description: "Monospace Tee",
      quantity: 3,
      amount: 65.18,
      taxCode: "",
      taxIncluded: true,
    });
    expect(second).toEqual({
      itemCode: "dmFyaWFudC1pZA==",
      description: "Monospace Tee",
      quantity: 1,
      amount: 21.73,
      discounted: false,
      taxCode: "",
      taxIncluded: true,
    });
    expect(third).toEqual({
      itemCode: "118223581",
      description: "Paul's Balance 420",
      quantity: 2,
      amount: 108.63,
      discounted: false,
      taxCode: "",
      taxIncluded: true,
    });
  });
});
