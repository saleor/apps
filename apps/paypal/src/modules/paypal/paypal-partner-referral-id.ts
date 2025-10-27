import { z } from "zod";

/**
 * PayPal Partner Referral ID
 * Returned when creating a partner referral for merchant onboarding
 */
const paypalPartnerReferralIdSchema = z.string().min(1).brand("PayPalPartnerReferralId");

export type PayPalPartnerReferralId = z.infer<typeof paypalPartnerReferralIdSchema>;

export const createPayPalPartnerReferralId = (raw: string): PayPalPartnerReferralId => {
  return paypalPartnerReferralIdSchema.parse(raw);
};
