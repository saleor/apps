import { describe, expect, it, test } from "vitest";

import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";

import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

const transformer = new AvataxCalculateTaxesPayloadLinesTransformer(
  new AvataxCalculateTaxesTaxCodeMatcher(),
);

const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

describe("AvataxCalculateTaxesPayloadLinesTransformer", () => {
  describe("transformWithDiscountType", () => {
    it("maps lines, adds shipping as line and maps the tax code of one product", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();

      const lines = transformer.transformWithDiscountType(
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

      const lines = transformer.transformWithDiscountType(
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
      const lines = transformer.transformWithDiscountType(
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
          amount: 47.96,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
          discounted: false,
        },
      ]);
    });

    it('Should return shipping amount "0" if sum of discounts make the amount lower than 0 (do not allow negative price)', () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();

      const shippingDiscount = 10.0;
      const shipping2Discount = 100.0;

      taxBaseMock.discounts = [
        {
          amount: {
            amount: shippingDiscount,
          },
          type: "SHIPPING",
        },
        {
          amount: {
            amount: shipping2Discount,
          },
          type: "SHIPPING",
        },
      ];

      const lines = transformer.transformWithDiscountType(
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
          // Do not allow lower than 0
          amount: 0,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
          discounted: false,
        },
      ]);
    });

    describe("Both SHIPPING and SUBTOTAL discounts types are provided", () => {
      it("Subtotal value will be mapped to DISCOUNTED. Shipping will NOT be discounted, but its value will be reduced. Case with single discounts.", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const shippingDiscount = 5.0;
        const subtotalDiscount = 10.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: subtotalDiscount,
            },
            type: "SUBTOTAL",
          },
          {
            amount: {
              amount: shippingDiscount,
            },
            type: "SHIPPING",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            amount: 48.33 - shippingDiscount,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
            discounted: false,
          },
        ]);
      });
      it("Subtotal value will be mapped to DISCOUNTED. Shipping will NOT be discounted, but its value will be reduced. Case with multiple discounts.", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const shippingDiscount = 5.0;
        const subtotalDiscount = 10.0;

        const shipping2Discount = 10.0;
        const subtotal2Discount = 15.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: subtotalDiscount,
            },
            type: "SUBTOTAL",
          },
          {
            amount: {
              amount: shippingDiscount,
            },
            type: "SHIPPING",
          },
          {
            amount: {
              amount: subtotal2Discount,
            },
            type: "SUBTOTAL",
          },
          {
            amount: {
              amount: shipping2Discount,
            },
            type: "SHIPPING",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            amount: 48.33 - shippingDiscount - shipping2Discount,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
            discounted: false,
          },
        ]);
      });
    });

    describe("Only SUBTOTAL type discount is provided", () => {
      it("Subtotal value will be mapped to DISCOUNTED. Shipping will not be reduced and not marked as discounted. Case with single SUBTOTAL discount", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const subtotalDiscount = 10.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: subtotalDiscount,
            },
            type: "SUBTOTAL",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            discounted: false,
          },
        ]);
      });
      it("Subtotal value will be mapped to DISCOUNTED. Shipping will not be reduced and not marked as discounted. Case with multiple SUBTOTAL discounts", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const subtotalDiscount = 10.0;
        const subtotal2Discount = 15.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: subtotalDiscount,
            },
            type: "SUBTOTAL",
          },
          {
            amount: {
              amount: subtotal2Discount,
            },
            type: "SUBTOTAL",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            discounted: false,
          },
        ]);
      });
    });

    describe("Only SHIPPING type discount is provided", () => {
      it("Subtotal value will not be reduced and not marked as discounted. Shipping value will reduced but not discounted. Case with single SHIPPING discount", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const shippingDiscount = 10.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: shippingDiscount,
            },
            type: "SHIPPING",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            amount: 48.33 - shippingDiscount,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
            discounted: false,
          },
        ]);
      });

      it("Subtotal value will not be reduced and not marked as discounted. Shipping value will reduced but not discounted. Case with multiple SHIPPING discounts", () => {
        const mockGenerator = new AvataxCalculateTaxesMockGenerator();
        const avataxConfigMock = mockGenerator.generateAvataxConfig();
        const taxBaseMock = mockGenerator.generateTaxBase();
        const matchesMock = mockGenerator.generateTaxCodeMatches();

        const shippingDiscount = 10.0;
        const shipping2Discount = 10.0;

        taxBaseMock.discounts = [
          {
            amount: {
              amount: shippingDiscount,
            },
            type: "SHIPPING",
          },
          {
            amount: {
              amount: shipping2Discount,
            },
            type: "SHIPPING",
          },
        ];

        const lines = transformer.transformWithDiscountType(
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
            amount: 48.33 - shippingDiscount - shipping2Discount,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
            discounted: false,
          },
        ]);
      });
    });
  });
});
