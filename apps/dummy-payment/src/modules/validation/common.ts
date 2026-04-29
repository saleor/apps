import { z } from "zod";

export const transactionEventTypeSchema = z.enum([
  "CHARGE_REQUEST",
  "CHARGE_ACTION_REQUIRED",
  "CHARGE_FAILURE",
  "CHARGE_SUCCESS",
  "AUTHORIZATION_REQUEST",
  "AUTHORIZATION_ACTION_REQUIRED",
  "AUTHORIZATION_FAILURE",
  "AUTHORIZATION_SUCCESS",
]);

export type TransactionEventType = z.infer<typeof transactionEventTypeSchema>;

export const transactionActionsSchema = z.array(
  z.union([z.literal("CHARGE"), z.literal("REFUND"), z.literal("CANCEL")])
);
