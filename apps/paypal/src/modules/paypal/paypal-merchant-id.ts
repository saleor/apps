import { z } from "zod";

/**
 * PayPal Merchant ID (also called Partner Merchant ID or payer_id)
 * Used to identify a merchant account in PayPal's system
 */
const paypalMerchantIdSchema = z.string().min(1).brand("PayPalMerchantId");

export type PayPalMerchantId = z.infer<typeof paypalMerchantIdSchema>;

export const createPayPalMerchantId = (raw: string): PayPalMerchantId => {
  return paypalMerchantIdSchema.parse(raw);
};
