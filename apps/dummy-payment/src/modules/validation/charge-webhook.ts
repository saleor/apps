import { z } from "zod";
import { transactionActionsSchema } from "./common";

export const chargeRequestedInputSchema = z
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
      authorizedAmount: z.object({
        amount: z
          .number()
          .positive("Transaction cannot be charged when authorizedAmount is negative")
          .refine((n) => n > 0, {
            message: "Transaction cannot be charged when there is no authorizedAmount",
          }),
        currency: z.string(),
      }),
    }),
  })
  .passthrough();

export const chargeRequestedSyncResponseSchema = z.object({
  pspReference: z.string(),
});

export const chargeRequestedAsyncResponseSchema = z.object({
  pspReference: z.string(),
  result: z.enum(["CHARGE_SUCCESS", "CHARGE_FAILURE"]),
  amount: z.number(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export const chargeRequestedResponseSchema = z.union([
  chargeRequestedSyncResponseSchema,
  chargeRequestedAsyncResponseSchema,
]);

export type ChargeRequestedResponse = z.infer<typeof chargeRequestedResponseSchema>;
