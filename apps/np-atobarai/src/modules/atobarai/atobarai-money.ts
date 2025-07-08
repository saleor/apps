import { z } from "zod";

const schema = z
  .object({
    amount: z.number().int().positive(),
    currency: z.literal("JPY"),
  })
  .brand("AtobaraiMoney");

export const createAtobaraiMoney = (raw: { amount: number; currency: string }) => schema.parse(raw);

export type AtobaraiMoney = z.infer<typeof schema>;
