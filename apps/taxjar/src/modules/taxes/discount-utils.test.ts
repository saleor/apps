import { expect, describe, it } from "vitest";
import { discountUtils } from "./discount-utils";

describe("discountUtils", () => {
  describe("distributeDiscount", () => {
    it("returns a numbers array thats sum is equal original sum - the discount", () => {
      const discount = 10;
      const nums = [42, 55, 67, 49];

      const result = discountUtils.distributeDiscount(discount, nums);
      const resultSum = result.reduce((acc, curr) => acc + curr, 0);

      expect(resultSum).toEqual(discount);
    });
    it("returns a numbers array where all items are >= 0", () => {
      const discount = 10;
      const nums = [1, 2, 3, 5];

      const result = discountUtils.distributeDiscount(discount, nums);

      expect(result.every((num) => num >= 0)).toBe(true);
    });
    it("throws an error when discount is greater than the sum of the numbers array", () => {
      const discount = 100;
      const nums = [1, 2, 3, 5];

      expect(() => discountUtils.distributeDiscount(discount, nums)).toThrowError();
    });
    it("returns the same numbers when no discount", () => {
      const discount = 0;
      const nums = [1, 2, 3, 5];

      const result = discountUtils.distributeDiscount(discount, nums);

      expect(result).toEqual([0, 0, 0, 0]);
    });
    it("returns throw error when discount = 0 and numbers = 0", () => {
      const discount = 0;
      const nums = [0, 0, 0, 0];

      expect(() => discountUtils.distributeDiscount(discount, nums)).toThrowError();
    });
  });

  describe("sumDiscounts", () => {
    it("sums up all discounts", () => {
      const discountsArray = [1, 2, 3, 4];
      const discounts = discountUtils.sumDiscounts(discountsArray);

      expect(discounts).toEqual(10);
    });

    it("returns 0 if there are no discounts", () => {
      const discounts = discountUtils.sumDiscounts([]);

      expect(discounts).toEqual(0);
    });
  });
});
