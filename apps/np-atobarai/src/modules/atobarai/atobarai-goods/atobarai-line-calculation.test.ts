import { describe, expect, it } from "vitest";

import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";

import { AtobaraiLineCalculation } from "./atobarai-line-calculation";

describe("AtobaraiLineCalculation", () => {
  describe("calculateProductLines", () => {
    it("should return product lines with product name when skuAsName is false", () => {
      const lineCalculation = new AtobaraiLineCalculation();

      const lines = lineCalculation.calculateProductLines({
        lines: mockedSourceObject.lines,
        useSkuAsName: false,
      });

      expect(lines).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
        ]
      `);
    });

    it("should return product lines with SKU when skuAsName is true", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const lines = lineCalculation.calculateProductLines({
        lines: mockedSourceObject.lines,
        useSkuAsName: true,
      });

      expect(lines).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "product-sku",
            "goods_price": 1234,
            "quantity": 5,
          },
        ]
      `);
    });
  });

  describe("calculateVoucherLine", () => {
    it("should return voucher line when voucher amount greater than 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const voucherLine = lineCalculation.calculateVoucherLine(2344);

      expect(voucherLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Voucher",
          "goods_price": 2344,
          "quantity": 1,
        }
      `);
    });

    it("should return null when voucher amount is 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const voucherLine = lineCalculation.calculateVoucherLine(0);

      expect(voucherLine).toBeNull();
    });

    it("should return null when voucher amount is not present", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const voucherLine = lineCalculation.calculateVoucherLine(undefined);

      expect(voucherLine).toBeNull();
    });
  });

  describe("calculateShippingLine", () => {
    it("should return shipping line when shipping amount is greater than 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const shippingLine = lineCalculation.calculateShippingLine(500);

      expect(shippingLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Shipping",
          "goods_price": 500,
          "quantity": 1,
        }
      `);
    });

    it("should return null when shipping amount is 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const shippingLine = lineCalculation.calculateShippingLine(0);

      expect(shippingLine).toBeNull();
    });
  });

  describe("calculateRefundAligment", () => {
    it("should return refund alignment line when refund amount is greater than 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const refundLine = lineCalculation.calculateRefundAligment(2344);

      expect(refundLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Discount",
          "goods_price": -2344,
          "quantity": 1,
        }
      `);
    });

    it("should return null when refund amount is 0", () => {
      const lineCalculation = new AtobaraiLineCalculation();
      const refundLine = lineCalculation.calculateRefundAligment(0);

      expect(refundLine).toBeNull();
    });
  });
});
