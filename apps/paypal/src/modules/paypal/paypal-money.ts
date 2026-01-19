import { z } from "zod";

export const paypalMoneySchema = z.object({
  currency_code: z.string().length(3),
  value: z.string().regex(/^\d+\.\d{2}$/),
});

export type PayPalMoney = z.infer<typeof paypalMoneySchema>;

export const createPayPalMoney = (args: {
  currencyCode: string;
  amount: number;
}): PayPalMoney => {
  return {
    currency_code: args.currencyCode.toUpperCase(),
    value: args.amount.toFixed(2),
  };
};

export const paypalMoneyToNumber = (money: PayPalMoney): number => {
  return parseFloat(money.value);
};
