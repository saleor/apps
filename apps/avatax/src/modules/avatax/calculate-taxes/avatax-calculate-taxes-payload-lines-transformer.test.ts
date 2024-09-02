import { describe, expect, it } from "vitest";

import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";

import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AutomaticallyDistributedDiscountsStrategy } from "../discounts";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

const transformer = new AvataxCalculateTaxesPayloadLinesTransformer(
  new AvataxCalculateTaxesTaxCodeMatcher(),
);

const discountsStrategy = new AutomaticallyDistributedDiscountsStrategy();

describe("AvataxCalculateTaxesPayloadLinesTransformer", () => {
  describe("transform", () => {
    it("maps lines, adds shipping as line and maps the tax code of one product", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();

      const lines = transformer.transform(
        taxBaseMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: DEFAULT_TAX_CLASS_ID,
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
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const taxBaseMock = mockGenerator.generateTaxBase({ shippingPrice: { amount: 0 } });

      const lines = transformer.transform(
        taxBaseMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: false,
        },
      ]);
    });

    it("should add discounted flag to lines when discounts are applied", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const lines = transformer.transform(
        taxBaseMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 48.33,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
          discounted: true,
        },
      ]);
    });
  });
});
