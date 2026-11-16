import { z } from "zod";

const squareErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export const InitializeTransactionSchema = z.object({
  transactionInitialize: z.object({
    transaction: z
      .object({
        id: z.string(),
      })
      .nullable(),
    transactionEvent: z
      .object({
        type: z.string().nullable(),
        message: z.string(),
      })
      .nullable(),
    data: z
      .object({
        square: z
          .object({
            paymentId: z.string().optional(),
            status: z.string().optional(),
            amount: z.number().optional(),
            remainingAmount: z.number().positive().optional(),
            cardLast4: z.string().optional(),
            errors: z.array(squareErrorSchema).optional(),
          })
          .optional(),
      })
      .passthrough()
      .nullable(),
    errors: z.array(
      z.object({
        field: z.string().nullable(),
        message: z.string().nullable(),
        code: z.string(),
      }),
    ),
  }),
});
