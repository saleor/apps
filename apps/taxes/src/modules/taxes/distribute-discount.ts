import { numbers } from "./numbers";

// ? shouldn't it be used in all providers?

export function distributeDiscount(discountSum: number, prices: number[]) {
  const totalNumbers = prices.length;
  const totalSum = prices.reduce((sum, number) => sum + number, 0);

  if (discountSum > totalSum) {
    throw new Error("Discount cannot be greater than total sum");
  }

  const discountRatio = discountSum / totalSum;
  const distributedDiscounts = [];

  for (let i = 0; i < totalNumbers; i++) {
    const number = prices[i];
    const discountAmount = number * discountRatio;

    distributedDiscounts.push(numbers.roundFloatToTwoDecimals(Number(discountAmount)));
  }

  return distributedDiscounts;
}
