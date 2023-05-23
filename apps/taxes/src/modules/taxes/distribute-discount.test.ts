import { expect, describe, it } from "vitest";
import { distributeDiscount } from "./distribute-discount";

describe("distributeDiscount", () => {
  it("should return a numbers array thats sum is equal original sum - the discount", () => {
    const discount = 10;
    const nums = [42, 55, 67, 49];

    const result = distributeDiscount(discount, nums);
    const resultSum = result.reduce((acc, curr) => acc + curr, 0);

    expect(resultSum).toEqual(discount);
  });
  it("should return a numbers array where all items are >= 0", () => {
    const discount = 10;
    const nums = [1, 2, 3, 5];

    const result = distributeDiscount(discount, nums);

    expect(result.every((num) => num >= 0)).toBe(true);
  });
  it("should throw an error when discount is greater than the sum of the numbers array", () => {
    const discount = 100;
    const nums = [1, 2, 3, 5];

    expect(() => distributeDiscount(discount, nums)).toThrowError();
  });
  it("should return the same numbers when no discount", () => {
    const discount = 0;
    const nums = [1, 2, 3, 5];

    const result = distributeDiscount(discount, nums);

    expect(result).toEqual([0, 0, 0, 0]);
  });
  it("should return throw error when discount = 0 and numbers = 0", () => {
    const discount = 0;
    const nums = [0, 0, 0, 0];

    expect(() => distributeDiscount(discount, nums)).toThrowError();
  });
});
