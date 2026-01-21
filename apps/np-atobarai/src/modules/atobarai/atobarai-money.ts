import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const schema = z
  .object({
    amount: z.number().int().positive(),
    currency: z.literal("JPY"),
  })
  .brand("AtobaraiMoney");

export const AtobaraiMoneyValidationError = BaseError.subclass("AtobaraiMoneyValidationError", {
  props: {
    _brand: "AtobaraiMoneyValidationError" as const,
  },
});

export const createAtobaraiMoney = (raw: { amount: number; currency: string }) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiMoneyValidationError(`Invalid money data: ${readableError.message}`, {
      cause: readableError,
    });
  }

  return parseResult.data;
};

export type AtobaraiMoney = z.infer<typeof schema>;
