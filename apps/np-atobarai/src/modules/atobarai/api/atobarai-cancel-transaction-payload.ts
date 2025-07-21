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

export const createAtobaraiCancelTransactionPayload = (args: {
  atobaraiTransactionId: AtobaraiTransactionId;
}): AtobaraiCancelTransactionPayload => {
  return schema.parse({
    transactions: [
      {
        np_transaction_id: args.atobaraiTransactionId,
      },
    ],
  });
};

export type AtobaraiCancelTransactionPayload = z.infer<typeof schema>;
