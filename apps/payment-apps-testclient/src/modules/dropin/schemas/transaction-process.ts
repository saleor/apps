import { z } from "zod";

export const TransactionProcessSchema = z.object({
  transactionProcess: z.object({
    data: z.object({
      // Passed to the drop-in as is, e.g. a ChallengeShopper response carries the 3DS2 action.
      paymentDetailsResponse: z
        .object({
          resultCode: z.string(),
          refusalReason: z.string().optional(),
        })
        .passthrough(),
    }),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
        code: z.string(),
      }),
    ),
  }),
});
