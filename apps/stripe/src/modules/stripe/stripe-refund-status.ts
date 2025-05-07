import { z } from "zod";

const StripeRefundStatusSchema = z
  .enum(["pending", "succeeded", "failed", "canceled", "requires_action"])
  .brand("StripeRefundStatus");

export const createStripeRefundStatus = (raw: string) => StripeRefundStatusSchema.parse(raw);

export type StripeRefundStatus = z.infer<typeof StripeRefundStatusSchema>;
