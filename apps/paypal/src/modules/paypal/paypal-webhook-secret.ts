import { z } from "zod";

export const paypalWebhookSecretSchema = z.string().min(1).brand("PayPalWebhookSecret");

export type PayPalWebhookSecret = z.infer<typeof paypalWebhookSecretSchema>;

export const createPayPalWebhookSecret = (raw: string) => {
  return paypalWebhookSecretSchema.safeParse(raw);
};