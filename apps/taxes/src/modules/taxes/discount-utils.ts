import { numbers } from "./numbers";

// ? shouldn't it be used in all providers?

/*
 * Saleor provides discounts as an array of objects with an amount. This function takes in the sum of those discounts and the prices of the line items and returns an array of numbers that represent the discount for each item. You can then use this array to return the individual discounts or to calculate the discounted prices.
 */

/*
 * // todo: look into how refunds affect the prices and discounts:
 * https://github.com/saleor/apps/pull/495#discussion_r1200321165
 */
function distributeDiscount(discountSum: number, prices: number[]) {
  const totalSum = prices.reduce((sum, number) => sum + number, 0);

  if (discountSum > totalSum) {
    throw new Error("Discount cannot be greater than total sum of line prices.");
  }

  if (totalSum === 0) {
    throw new Error("Cannot distribute discount when total sum is 0.");
  }

  const discountRatio = discountSum / totalSum;

  const distributedDiscounts = prices.map((number) => {
    const discountAmount = number * discountRatio;

    return numbers.roundFloatToTwoDecimals(Number(discountAmount));
  });

  return distributedDiscounts;
}

function sumDiscounts(discounts: number[]): number {
  return discounts.reduce((total, current) => total + Number(current), 0);
}

export const discountUtils = {
  distributeDiscount,
  sumDiscounts,
};
