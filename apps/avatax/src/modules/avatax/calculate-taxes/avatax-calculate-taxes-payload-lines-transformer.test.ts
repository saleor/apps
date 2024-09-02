import { describe, expect, it, test } from "vitest";

import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AutomaticallyDistributedDiscountsStrategy } from "../discounts";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

const transformer = new AvataxCalculateTaxesPayloadLinesTransformer();

const discountsStrategy = new AutomaticallyDistributedDiscountsStrategy();

describe("AvataxCalculateTaxesPayloadLinesTransformer", () => {
  /**
   * TODO: Remove this suite once transformWithDiscountType will be used,
   * all tests have been moved there
   */
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

  describe("transformWithDiscountType", () => {
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

    describe("Both SHIPPING and SUBTOTAL discounts types are provided", () => {
      it.todo(
        "Subtotal value will be mapped to DISCOUNTED. Shipping will NOT be discounted, but its value will be reduced. Case with single discounts.",
      );
      it.todo(
        "Subtotal value will be mapped to DISCOUNTED. Shipping will NOT be discounted, but its value will be reduced. Case with multiple discounts.",
      );
    });

    describe("Only SUBTOTAL type discount is provided", () => {
      it.todo(
        "Subtotal value will be mapped to DISCOUNTED. Shipping will not be reduced and not marked as discounted. Case with single SUBTOTAL discount",
      );
      it.todo(
        "Subtotal value will be mapped to DISCOUNTED. Shipping will not be reduced and not marked as discounted. Case with multiple SUBTOTAL discounts",
      );
    });

    describe("Only SHIPPING type discount is provided", () => {
      it.todo(
        "Subtotal value will not be reduced and not marked as discounted. Shipping value will reduced but not discounted. Case with single SHIPPING discount",
      );
      it.todo(
        "Subtotal value will not be reduced and not marked as discounted. Shipping value will reduced but not discounted. Case with multiple SHIPPING discounts",
      );
    });
  });
});
