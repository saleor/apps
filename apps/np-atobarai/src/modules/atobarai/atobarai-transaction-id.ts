import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

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
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiTransactionIdValidationError(
      `Invalid transaction ID: "${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};
