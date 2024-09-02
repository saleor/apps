import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it, test } from "vitest";

import { SHIPPING_ITEM_CODE } from "@/modules/avatax/calculate-taxes/avatax-shipping-line";
import { DEFAULT_TAX_CLASS_ID } from "@/modules/avatax/constants";

import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadTransformer } from "./avatax-calculate-taxes-payload-transformer";

describe("AvataxCalculateTaxesPayloadTransformer", () => {
  it("returns document type of SalesInvoice", async () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator();
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const payloadMock = {
      taxBase: taxBaseMock,
      issuingPrincipal: {
        __typename: "User",
        id: "1",
      },
    } as unknown as CalculateTaxesPayload;

    const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
      // @ts-expect-error
      payloadMock,
      avataxConfigMock,
      matchesMock,
      discountsStrategy,
    );

    expect(payload.model.type).toBe(DocumentType.SalesOrder);
  });

  it("calculates discount amount when there are discounts", async () => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const payloadMock = {
      taxBase: taxBaseMock,
      issuingPrincipal: {
        __typename: "User",
        id: "1",
      },
    } as unknown as CalculateTaxesPayload;

    const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
      // @ts-expect-error
      payloadMock,
      avataxConfigMock,
      matchesMock,
      discountsStrategy,
    );

    expect(payload.model.discount).toBe(21);
  });

  test.each([
    {
      lineDiscountAmounts: [0.1, 0.2],
      expectedDiscountSum: 0.3,
    },
    {
      lineDiscountAmounts: [0.1, 0.7],
      expectedDiscountSum: 0.8,
    },
    {
      lineDiscountAmounts: [0.1, 0.5],
      expectedDiscountSum: 0.6,
    },
    {
      lineDiscountAmounts: [0.1, 0.1, 0.1, 0.1, 0.1],
      expectedDiscountSum: 0.5,
    },
    {
      lineDiscountAmounts: [1, 1.1, 1.2],
      expectedDiscountSum: 3.3,
    },
  ])("Sums discounts properly", async ({ lineDiscountAmounts, expectedDiscountSum }) => {
    const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
    const avataxConfigMock = mockGenerator.generateAvataxConfig();
    const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

    const taxBaseMock = mockGenerator.generateTaxBase();
    const matchesMock = mockGenerator.generateTaxCodeMatches();
    const payloadMock = {
      taxBase: taxBaseMock,
      issuingPrincipal: {
        __typename: "User",
        id: "1",
      },
    } as unknown as CalculateTaxesPayload;

    taxBaseMock.discounts = lineDiscountAmounts.map((amount) => ({
      amount: {
        amount: amount,
      },
      type: "SUBTOTAL",
    }));

    const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
      // @ts-expect-error
      payloadMock,
      avataxConfigMock,
      matchesMock,
      discountsStrategy,
    );

    expect(payload.model.discount).toBe(expectedDiscountSum);
  });

  describe("Discounts calculation for SUBTOTAL and SHIPPING types", () => {
    it("Set product lines to be discounted. Set shipping line NOT to be discounted, but reduces its amount. Adds discount field which is a sum of SUBTOTAL-type discount", async () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const payloadMock = {
        taxBase: taxBaseMock,
        issuingPrincipal: {
          __typename: "User",
          id: "1",
        },
      } as unknown as CalculateTaxesPayload;

      const subtotalDiscount1 = 10;
      const subtotalDiscount2 = 20.33;
      const shippingDiscount1 = 10;
      const shippingDiscount2 = 0.1;

      taxBaseMock.discounts = [
        {
          amount: {
            amount: subtotalDiscount1,
          },
          // @ts-expect-error
          type: "SUBTOTAL",
        },
        {
          amount: {
            amount: shippingDiscount1,
          },
          // @ts-expect-error
          type: "SHIPPING",
        },
        {
          amount: {
            amount: subtotalDiscount2,
          },
          // @ts-expect-error
          type: "SUBTOTAL",
        },
        {
          amount: {
            amount: shippingDiscount2,
          },
          // @ts-expect-error
          type: "SHIPPING",
        },
      ];

      const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
        // @ts-expect-error
        payloadMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(payload.model.discount).toBe(30.33);

      const shippingLine = payload.model.lines.find((l) => l.itemCode === SHIPPING_ITEM_CODE);

      expect(shippingLine?.amount).toEqual(38.23);
      expect(shippingLine?.discounted).toEqual(false);
    });
  });
  describe("Discounts calculation for SUBTOTAL only type", () => {
    it("Set product lines to be discounted. Set shipping line NOT to be discounted, and do not modify its value. Adds discount field which is a sum of SUBTOTAL-type discount", async () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const payloadMock = {
        taxBase: taxBaseMock,
        issuingPrincipal: {
          __typename: "User",
          id: "1",
        },
      } as unknown as CalculateTaxesPayload;

      const subtotalDiscount1 = 10;
      const subtotalDiscount2 = 20.33;

      taxBaseMock.discounts = [
        {
          amount: {
            amount: subtotalDiscount1,
          },
          // @ts-expect-error
          type: "SUBTOTAL",
        },

        {
          amount: {
            amount: subtotalDiscount2,
          },
          // @ts-expect-error
          type: "SUBTOTAL",
        },
      ];

      const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
        // @ts-expect-error
        payloadMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(payload.model.discount).toBe(30.33);

      const shippingLine = payload.model.lines.find((l) => l.itemCode === SHIPPING_ITEM_CODE);

      expect(shippingLine?.amount).toEqual(48.33);
      expect(shippingLine?.discounted).toEqual(false);
    });
  });
  describe("Discounts calculation for SHIPPING only type", () => {
    it("Set product lines to be NOT discounted. Set shipping line NOT to be discounted, but reduces its amount. Discount field should not exist", async () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator("withDiscounts");
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const discountsStrategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

      const taxBaseMock = mockGenerator.generateTaxBase();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const payloadMock = {
        taxBase: taxBaseMock,
        issuingPrincipal: {
          __typename: "User",
          id: "1",
        },
      } as unknown as CalculateTaxesPayload;

      const shippingDiscount1 = 10;
      const shippingDiscount2 = 0.1;

      taxBaseMock.discounts = [
        {
          amount: {
            amount: shippingDiscount1,
          },
          // @ts-expect-error
          type: "SHIPPING",
        },

        {
          amount: {
            amount: shippingDiscount2,
          },
          // @ts-expect-error
          type: "SHIPPING",
        },
      ];

      const payload = await new AvataxCalculateTaxesPayloadTransformer().transform(
        // @ts-expect-error
        payloadMock,
        avataxConfigMock,
        matchesMock,
        discountsStrategy,
      );

      expect(payload.model.discount).toBe(0);

      const shippingLine = payload.model.lines.find((l) => l.itemCode === SHIPPING_ITEM_CODE);

      expect(shippingLine?.amount).toEqual(38.23);
      expect(shippingLine?.discounted).toEqual(false);
    });
  });
});
