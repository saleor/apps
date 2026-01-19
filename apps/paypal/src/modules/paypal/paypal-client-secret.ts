import { z } from "zod";

export const paypalClientSecretSchema = z.string().min(1).brand("PayPalClientSecret");

export type PayPalClientSecret = z.infer<typeof paypalClientSecretSchema>;

export const createPayPalClientSecret = (raw: string): PayPalClientSecret => {
  return paypalClientSecretSchema.parse(raw);
};
