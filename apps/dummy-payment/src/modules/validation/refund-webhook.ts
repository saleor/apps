import { z } from "zod";
import { transactionActionsSchema } from "./common";

export const refundRequestedInputSchema = z
  .object({
    action: z.object({
      amount: z
        .number({
          required_error: "Charge amount cannot be missing",
          invalid_type_error: "Charge amount is not a valid number",
        })
        .positive("Charge amount cannot be negative")
        .refine((n) => n > 0, {
          message: "Charge amount must be greater than zero",
        }),
    }),
    transaction: z.object({
      id: z.string(),
      chargedAmount: z.object({
        amount: z
          .number()
          .positive("Transaction cannot be refunded when chargedAmount is negative")
          .refine((n) => n > 0, {
            message: "Transaction cannot be refunded when there is no chargedAmount",
          }),
        currency: z.string(),
      }),
    }),
  })
  .passthrough();

export const refundRequestedSyncResponseSchema = z.object({
  pspReference: z.string(),
});

export const refundRequestedAsyncResponseSchema = z.object({
  pspReference: z.string(),
  result: z.enum(["REFUND_SUCCESS", "REFUND_FAILURE"]),
  amount: z.number(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export const refundRequestedResponseSchema = z.union([
  refundRequestedSyncResponseSchema,
  refundRequestedAsyncResponseSchema,
]);

export type RefundRequestedResponse = z.infer<typeof refundRequestedResponseSchema>;
