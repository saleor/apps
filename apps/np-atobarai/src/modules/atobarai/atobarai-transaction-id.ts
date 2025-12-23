import { BaseError } from "@saleor/errors";
import { z } from "zod";

export const AtobaraiTransactionIdSchema = z.string().length(11).brand("AtobaraiTransactionId");

export type AtobaraiTransactionId = z.infer<typeof AtobaraiTransactionIdSchema>;

export const AtobaraiTransactionIdValidationError = BaseError.subclass(
  "AtobaraiTransactionIdValidationError",
  {
    props: {
      _brand: "AtobaraiTransactionIdValidationError" as const,
    },
  },
);

export const createAtobaraiTransactionId = (rawTransactionId: string): AtobaraiTransactionId => {
  const parseResult = AtobaraiTransactionIdSchema.safeParse(rawTransactionId);

  if (!parseResult.success) {
    throw new AtobaraiTransactionIdValidationError(
      `Invalid transaction ID "${rawTransactionId}": ${parseResult.error.errors
        .map((e) => e.message)
        .join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};
