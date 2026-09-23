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
        action: z
          .object({
            paymentMethodType: z.string(),
            paymentData: z.string(),
            url: z.string().optional(),
            type: z.string(),
            qrCodeData: z.string().optional(),
            sdkData: z
              .object({
                token: z.string(),
              })
              .optional(),
          })
          .optional(),
        resultCode: z.enum(["Authorised", "Pending", "Refused", "Received", "Cancelled", "Error"]),
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
