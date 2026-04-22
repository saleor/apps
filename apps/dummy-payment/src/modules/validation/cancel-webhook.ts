import { z } from "zod";
import { transactionActionsSchema } from "./common";

export const cancelationRequestedInputSchema = z
  .object({
    transaction: z.object({
      id: z.string(),
      authorizedAmount: z.object({
        amount: z
          .number()
          .positive("Transaction cannot be charged when authorizedAmount is negative")
          .refine((n) => n > 0, {
            message: "Transaction cannot be cancelled when there is no authorizedAmount",
          }),
        currency: z.string(),
      }),
    }),
  })
  .passthrough();

export const cancelationRequestedSyncResponseSchema = z.object({
  pspReference: z.string(),
});

export const cancelationRequestedAsyncResponseSchema = z.object({
  pspReference: z.string(),
  result: z.enum(["CANCEL_SUCCESS", "CANCEL_FAILURE"]),
  amount: z.number(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export const cancelationRequestedResponseSchema = z.union([
  cancelationRequestedSyncResponseSchema,
  cancelationRequestedAsyncResponseSchema,
]);

export type CancelationRequestedResponse = z.infer<typeof cancelationRequestedResponseSchema>;
