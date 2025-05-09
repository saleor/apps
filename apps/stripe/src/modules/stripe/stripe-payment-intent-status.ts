import { z } from "zod";

const StripePaymentIntentStatusSchema = z
  .enum([
    "requires_action",
    "requires_confirmation",
    "requires_payment_method",
    "canceled",
    "processing",
    "requires_capture",
    "succeeded",
  ])
  .brand("StripePaymentIntentStatus");

export const createStripePaymentIntentStatus = (raw: string) =>
  StripePaymentIntentStatusSchema.parse(raw);

export type StripePaymentIntentStatus = z.infer<typeof StripePaymentIntentStatusSchema>;
