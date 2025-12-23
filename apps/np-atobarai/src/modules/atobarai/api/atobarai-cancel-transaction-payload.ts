import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiCancelTransactionPayloadValidationError(
      `Invalid cancel transaction payload: ${parseResult.error.errors
        .map((e) => e.message)
        .join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiCancelTransactionPayload = z.infer<typeof schema>;
