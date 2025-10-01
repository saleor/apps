import { z } from "zod";

export const paypalOrderIdSchema = z.string().min(1).brand("PayPalOrderId");

export type PayPalOrderId = z.infer<typeof paypalOrderIdSchema>;

export const createPayPalOrderId = (raw: string): PayPalOrderId => {
  return paypalOrderIdSchema.parse(raw);
};
