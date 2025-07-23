import { z } from "zod";

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

export const createAtobaraiCancelTransactionSuccessResponse = (
  raw: unknown | AtobaraiCancelTransactionSuccessResponse,
) => schema.parse(raw);

export type AtobaraiCancelTransactionSuccessResponse = z.infer<typeof schema>;
