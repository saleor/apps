import { z } from "zod";

import { AtobaraiTransactionIdSchema } from "./atobarai-transaction-id";

const schema = z
  .object({
    results: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
      }),
    ),
  })
  .brand("AtobaraiFulfillmentReportSuccessResponse");

export const createAtobaraiFulfillmentReportSuccessResponse = (raw: unknown) => schema.parse(raw);

export type AtobaraiFulfillmentReportSuccessResponse = z.infer<typeof schema>;
