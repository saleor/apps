import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiMoneyValidationError(
      `Invalid money data: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiMoney = z.infer<typeof schema>;
