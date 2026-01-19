import { z } from "zod";

export const saleorMoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export type SaleorMoney = z.infer<typeof saleorMoneySchema>;

export const createSaleorMoney = (args: { amount: number; currency: string }): SaleorMoney => {
  return saleorMoneySchema.parse(args);
};
