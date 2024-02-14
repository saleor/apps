import { describe, expect, it } from "vitest";
import {
  AvataxOrderConfirmedPayloadLinesTransformer,
  resolveAvataxTransactionLineNumber,
} from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { OrderLineFragment } from "../../../../generated/graphql";

const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const orderMock = mockGenerator.generateOrder();

const matches: AvataxTaxCodeMatches = [];

describe("resolveAvataxTransactionLineNumber", () => {
  it("takes last 50 characters of id", () => {
    expect(
      resolveAvataxTransactionLineNumber({
        id: "c9a81439-2dd3-4d0f-a782-d51f41d8e959-4041b7a0-2aab-4777-b310-08b6995d6220",
      } as unknown as OrderLineFragment),
    ).toBe("-d51f41d8e959-4041b7a0-2aab-4777-b310-08b6995d6220");
  });
  it("returns full id if less than 50 characters", () => {
    expect(
      resolveAvataxTransactionLineNumber({
        id: "abc123",
      } as unknown as OrderLineFragment),
    ).toBe("abc123");
  });
});

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
