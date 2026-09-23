import { z } from "zod";

export const TransactionProcessSchema = z.object({
  transactionProcess: z.object({
    data: z.object({
      paymentDetailsResponse: z.object({
        resultCode: z.enum(["Authorised", "Pending", "Refused", "Received"]),
        refusalReason: z.string().optional(),
      }),
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
