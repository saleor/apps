import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

import { AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z
  .object({
    results: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
      }),
    ),
  })
  .brand("AtobaraiCancelTransactionSuccessResponse");

export const AtobaraiCancelTransactionSuccessResponseValidationError = BaseError.subclass(
  "AtobaraiCancelTransactionSuccessResponseValidationError",
  {
    props: {
      _brand: "AtobaraiCancelTransactionSuccessResponseValidationError" as const,
    },
  },
);

export const createAtobaraiCancelTransactionSuccessResponse = (
  raw: unknown | AtobaraiCancelTransactionSuccessResponse,
) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiCancelTransactionSuccessResponseValidationError(
      `Invalid Atobarai cancel transaction success response format: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiCancelTransactionSuccessResponse = z.infer<typeof schema>;
