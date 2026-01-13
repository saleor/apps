import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

import { AtobaraiTransactionId, AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z
  .object({
    transactions: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
      }),
    ),
  })
  .brand("AtobaraiCancelTransactionPayload");

export const AtobaraiCancelTransactionPayloadValidationError = BaseError.subclass(
  "AtobaraiCancelTransactionPayloadValidationError",
  {
    props: {
      _brand: "AtobaraiCancelTransactionPayloadValidationError" as const,
    },
  },
);

export const createAtobaraiCancelTransactionPayload = (args: {
  atobaraiTransactionId: AtobaraiTransactionId;
}): AtobaraiCancelTransactionPayload => {
  const parseResult = schema.safeParse({
    transactions: [
      {
        np_transaction_id: args.atobaraiTransactionId,
      },
    ],
  });

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiCancelTransactionPayloadValidationError(
      `Invalid cancel transaction payload: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiCancelTransactionPayload = z.infer<typeof schema>;
