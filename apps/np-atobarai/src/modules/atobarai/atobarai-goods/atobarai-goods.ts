import { z } from "zod";

export const AtobaraiGoodsSchema = z
  .array(
    z.object({
      goods_name: z.string(),
      goods_price: z.number(),
      quantity: z.number(),
    }),
  )
  .brand("AtobaraiGoods");

export type AtobaraiGoods = z.infer<typeof AtobaraiGoodsSchema>;
