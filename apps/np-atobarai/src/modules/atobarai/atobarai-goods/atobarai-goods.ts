import { BaseError } from "@saleor/errors";
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

export const AtobaraiGoodsValidationError = BaseError.subclass("AtobaraiGoodsValidationError", {
  props: {
    _brand: "AtobaraiGoodsValidationError" as const,
  },
});

export const createAtobaraiGoods = (raw: unknown): AtobaraiGoods => {
  const parseResult = AtobaraiGoodsSchema.safeParse(raw);

  if (!parseResult.success) {
    throw new AtobaraiGoodsValidationError(
      `Invalid goods data: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiGoods = z.infer<typeof AtobaraiGoodsSchema>;
