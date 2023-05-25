import { describe, expect, it } from "vitest";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { mapPayloadLines } from "./avatax-calculate-taxes-payload-transformer";

describe("mapPayloadLines", () => {
  it("map lines and adds shipping as line", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase();
    const lines = mapPayloadLines(taxBaseMock, avataxConfigMock);

    expect(lines).toEqual([
      {
        amount: 60,
        quantity: 3,
        taxCode: "",
        taxIncluded: true,
      },
      {
        amount: 20,
        quantity: 1,
        taxCode: "",
        taxIncluded: true,
      },
      {
        amount: 100,
        quantity: 2,
        taxCode: "",
        taxIncluded: true,
      },
      {
        amount: 48.33,
        itemCode: "Shipping",
        quantity: 1,
        taxCode: "FR000000",
        taxIncluded: true,
      },
    ]);
  });
  it("when no shipping in tax base, does not add shipping as line", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase({ shippingPrice: { amount: 0 } });

    const lines = mapPayloadLines(taxBaseMock, avataxConfigMock);

    expect(lines).toEqual([
      {
        amount: 60,
        quantity: 3,
        taxCode: "",
        taxIncluded: true,
      },
      {
        amount: 20,
        quantity: 1,
        taxCode: "",
        taxIncluded: true,
      },
      {
        amount: 100,
        quantity: 2,
        taxCode: "",
        taxIncluded: true,
      },
    ]);
  });
});
