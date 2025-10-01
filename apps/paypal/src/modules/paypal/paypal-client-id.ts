import { z } from "zod";

export const paypalClientIdSchema = z.string().min(1).brand("PayPalClientId");

export type PayPalClientId = z.infer<typeof paypalClientIdSchema>;

export const createPayPalClientId = (raw: string): PayPalClientId => {
  return paypalClientIdSchema.parse(raw);
};
