import { describe, expect, it } from "vitest";
import {
  AvataxCalculateTaxesMapPayloadArgs,
  SHIPPING_ITEM_CODE,
  mapPayloadLines,
  mapResponseProductLines,
  mapResponseShippingLine,
} from "./avatax-calculate-taxes-map";
import { transactionModelMocks } from "./mocks";
import { avataxMockFactory } from "./avatax-mock-factory";

const mapPayloadArgsMocks: AvataxCalculateTaxesMapPayloadArgs = {
  channel: avataxMockFactory.createMockChannelConfig(),
  taxBase: avataxMockFactory.createMockTaxBase(),
  config: avataxMockFactory.createMockAvataxConfig(),
};

describe("avataxCalculateTaxesMaps", () => {
  describe("mapResponseShippingLine", () => {
    it("when shipping line is not present, returns 0s", () => {
      const shippingLine = mapResponseShippingLine(transactionModelMocks.noShippingLine);

      expect(shippingLine).toEqual({
        shipping_price_gross_amount: 0,
        shipping_price_net_amount: 0,
        shipping_tax_rate: 0,
      });
    });
    it("when shipping line is not taxable, returns line amount", () => {
      const nonTaxableShippingLine = mapResponseShippingLine(transactionModelMocks.nonTaxable);

      expect(nonTaxableShippingLine).toEqual({
        shipping_price_gross_amount: 77.51,
        shipping_price_net_amount: 77.51,
        shipping_tax_rate: 0,
      });
    });

    it("when shipping line is taxable and tax is included, returns calculated gross & net amounts", () => {
      const taxableShippingLine = mapResponseShippingLine(
        transactionModelMocks.taxable.taxIncluded
      );

      expect(taxableShippingLine).toEqual({
        shipping_price_gross_amount: 77.51,
        shipping_price_net_amount: 70.78,
        shipping_tax_rate: 0,
      });
    });

    it("when shipping line is taxable and tax is not included, returns calculated gross & net amounts", () => {
      const taxableShippingLine = mapResponseShippingLine(
        transactionModelMocks.taxable.taxNotIncluded
      );

      expect(taxableShippingLine).toEqual({
        shipping_price_gross_amount: 84.87,
        shipping_price_net_amount: 77.51,
        shipping_tax_rate: 0,
      });
    });
  });
  describe("mapResponseProductLines", () => {
    it("when product lines are not taxable, returns line amount", () => {
      const nonTaxableProductLines = mapResponseProductLines(transactionModelMocks.nonTaxable);

      expect(nonTaxableProductLines).toEqual([
        {
          total_gross_amount: 20,
          total_net_amount: 20,
          tax_rate: 0,
        },
      ]);
    });

    it("when product lines are taxable and tax is included, returns calculated gross & net amounts", () => {
      const taxableProductLines = mapResponseProductLines(
        transactionModelMocks.taxable.taxIncluded
      );

      expect(taxableProductLines).toEqual([
        {
          total_gross_amount: 40,
          total_net_amount: 36.53,
          tax_rate: 0,
        },
      ]);
    });

    it("when product lines are taxable and tax is not included, returns calculated gross & net amounts", () => {
      const taxableProductLines = mapResponseProductLines(
        transactionModelMocks.taxable.taxNotIncluded
      );

      expect(taxableProductLines).toEqual([
        {
          total_gross_amount: 43.8,
          total_net_amount: 40,
          tax_rate: 0,
        },
      ]);
    });
  });
  describe("mapLines", () => {
    const lines = mapPayloadLines(mapPayloadArgsMocks.taxBase, mapPayloadArgsMocks.config);

    it("includes shipping as a line", () => {
      expect(lines).toContainEqual({
        itemCode: SHIPPING_ITEM_CODE,
        quantity: 1,
        amount: 48.33,
        taxCode: mapPayloadArgsMocks.config.shippingTaxCode,
        taxIncluded: false,
      });
    });

    it("returns the correct quantity of individual lines", () => {
      expect(lines).toContainEqual({
        quantity: 3,
        amount: 252,
        taxCode: "",
        taxIncluded: false,
      });
    });
  });
});
