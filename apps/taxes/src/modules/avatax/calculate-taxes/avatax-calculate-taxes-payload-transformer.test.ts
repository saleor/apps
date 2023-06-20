import { describe, expect, it } from "vitest";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";

describe("AvataxCalculateTaxesPayloadTransformer", () => {
  it("when discounts, calculates the sum of discounts", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase({ discounts: [{ amount: { amount: 10 } }] });
    const matchesMock = mockGenerator.generateTaxCodeMatches();

    const payload = new AvataxCalculateTaxesPayloadTransformer().transform(
      taxBaseMock,
      avataxConfigMock,
      matchesMock
    );

    expect(payload.model.discount).toEqual(10);
  });
  it("when no discounts, the sum of discount is 0", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();

    const payload = new AvataxCalculateTaxesPayloadTransformer().transform(
      taxBaseMock,
      avataxConfigMock,
      matchesMock
    );

    expect(payload.model.discount).toEqual(0);
  });
});
