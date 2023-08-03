import { describe, expect, it } from "vitest";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";

const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const orderMock = mockGenerator.generateOrder();

const matches: AvataxTaxCodeMatches = [];

describe("AvataxOrderConfirmedPayloadLinesTransformer", () => {
  const lines = linesTransformer.transform(orderMock, avataxConfigMock, matches);

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
