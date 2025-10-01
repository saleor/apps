import { z } from "zod";

export const paypalRefundIdSchema = z.string().min(1).brand("PayPalRefundId");

export type PayPalRefundId = z.infer<typeof paypalRefundIdSchema>;

export const createPayPalRefundId = (raw: string): PayPalRefundId => {
  return paypalRefundIdSchema.parse(raw);
};