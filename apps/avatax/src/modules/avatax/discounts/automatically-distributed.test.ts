import { describe, expect, it } from "vitest";

import { TaxBaseFragment } from "../../../../generated/graphql";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "./automatically-distributed";

describe("AutomaticallyDistributedDiscountsStrategy", () => {
  const strategy = new AutomaticallyDistributedProductLinesDiscountsStrategy();

  describe("getDiscountAmount", () => {
    it("should get total discount amount", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [
        {
          amount: {
            amount: 21,
          },
          type: "SUBTOTAL",
        },
        {
          amount: {
            amount: 0.37,
          },
          type: "SUBTOTAL",
        },
      ];

      const totalDiscount = strategy.getDiscountAmount(discountsPayload);

      expect(totalDiscount).toBe(21.37);
    });

    it("should return 0 if no discounts", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [];

      const totalDiscount = strategy.getDiscountAmount(discountsPayload);

      expect(totalDiscount).toBe(0);
    });

    it("should return 0 if discounts are undefined", () => {
      const totalDiscount = strategy.getDiscountAmount(undefined);

      expect(totalDiscount).toBe(0);
    });

    it("should return 0 if there are discounts with amount 0", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [
        {
          amount: {
            amount: 0,
          },
          type: "SUBTOTAL",
        },
      ];

      const totalDiscount = strategy.getDiscountAmount(discountsPayload);

      expect(totalDiscount).toBe(0);
    });
  });

  describe("areLinesDiscounted", () => {
    it("should return true if there are discounts", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [
        {
          amount: {
            amount: 21,
          },
          type: "SUBTOTAL",
        },
        {
          amount: {
            amount: 0.37,
          },
          type: "SUBTOTAL",
        },
      ];

      const areLinesDiscounted = strategy.areLinesDiscounted(discountsPayload);

      expect(areLinesDiscounted).toBe(true);
    });

    it("should return false if there are no discounts", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [];

      const areLinesDiscounted = strategy.areLinesDiscounted(discountsPayload);

      expect(areLinesDiscounted).toBe(false);
    });

    it("should return false if there are discounts with amount 0", () => {
      const discountsPayload: TaxBaseFragment["discounts"] = [
        {
          amount: {
            amount: 0,
          },
          type: "SHIPPING",
        },
      ];

      const areLinesDiscounted = strategy.areLinesDiscounted(discountsPayload);

      expect(areLinesDiscounted).toBe(false);
    });
  });
});
