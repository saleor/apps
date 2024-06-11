import { describe, expect, it } from "vitest";
import { PriceReductionDiscountsStrategy } from "./price-reduction";

describe("PriceReductionDiscountsStrategy", () => {
  const strategy = new PriceReductionDiscountsStrategy();

  describe("getDiscountAmount", () => {
    it("should return undefined - this is noop", () => {
      const totalDiscount = strategy.getDiscountAmount();

      expect(totalDiscount).toBeUndefined();
    });
  });

  describe("areLinesDiscounted", () => {
    it("should return false - this is noop", () => {
      const areLinesDiscounted = strategy.areLinesDiscounted();

      expect(areLinesDiscounted).toBeUndefined();
    });
  });
});
