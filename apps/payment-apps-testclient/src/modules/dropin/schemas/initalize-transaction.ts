import { z } from "zod";

export const InitalizeTransactionSchema = z.object({
  transactionInitialize: z.object({
    transaction: z.object({
      id: z.string(),
    }),
    data: z.object({
      paymentResponse: z.object({
        order: z
          .object({
            orderData: z.string().optional(),
            pspReference: z.string().optional(),
            remainingAmount: z
              .object({
                value: z.number(),
                currency: z.string(),
              })
              .optional(),
          })
          .optional(),
        // Passed to the drop-in as is, and each action type (e.g. threeDS2) has its own fields.
        action: z
          .object({ type: z.string(), paymentMethodType: z.string() })
          .passthrough()
          .optional(),
        // Adyen returns more codes than the client checks, e.g. IdentifyShopper during 3DS2.
        resultCode: z.string(),
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
