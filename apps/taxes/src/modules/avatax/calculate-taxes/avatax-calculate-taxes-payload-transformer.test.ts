import { describe, expect, it } from "vitest";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import {
  AvataxCalculateTaxesPayloadTransformer,
  mapPayloadLines,
} from "./avatax-calculate-taxes-payload-transformer";

describe("AvataxCalculateTaxesPayloadTransformer", () => {
  it("when discounts, calculates the sum of discounts", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase({ discounts: [{ amount: { amount: 10 } }] });

    const payload = new AvataxCalculateTaxesPayloadTransformer().transform({
      taxBase: taxBaseMock,
      providerConfig: avataxConfigMock,
    });

    expect(payload.model.discount).toEqual(10);
  });
  it("when no discounts, the sum of discount is 0", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase();

    const payload = new AvataxCalculateTaxesPayloadTransformer().transform({
      taxBase: taxBaseMock,
      providerConfig: avataxConfigMock,
    });

    expect(payload.model.discount).toEqual(0);
  });
});

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
        discounted: false,
      },
      {
        amount: 20,
        quantity: 1,
        taxCode: "",
        taxIncluded: true,
        discounted: false,
      },
      {
        amount: 100,
        quantity: 2,
        taxCode: "",
        taxIncluded: true,
        discounted: false,
      },
      {
        amount: 48.33,
        itemCode: "Shipping",
        quantity: 1,
        taxCode: "FR000000",
        taxIncluded: true,
        discounted: false,
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
        discounted: false,
      },
      {
        amount: 20,
        quantity: 1,
        taxCode: "",
        taxIncluded: true,
        discounted: false,
      },
      {
        amount: 100,
        quantity: 2,
        taxCode: "",
        taxIncluded: true,
        discounted: false,
      },
    ]);
  });
  it("when discounts, sets discounted to true", () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const taxBaseMock = mockGenerator.generateTaxBase({ discounts: [{ amount: { amount: 10 } }] });

    const lines = mapPayloadLines(taxBaseMock, avataxConfigMock);

    expect(lines).toEqual([
      {
        amount: 60,
        quantity: 3,
        taxCode: "",
        taxIncluded: true,
        discounted: true,
      },
      {
        amount: 20,
        quantity: 1,
        taxCode: "",
        taxIncluded: true,
        discounted: true,
      },
      {
        amount: 100,
        quantity: 2,
        taxCode: "",
        taxIncluded: true,
        discounted: true,
      },
      {
        amount: 48.33,
        discounted: true,
        itemCode: "Shipping",
        quantity: 1,
        taxCode: "FR000000",
        taxIncluded: true,
      },
    ]);
  });
});
