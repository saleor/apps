import { z } from "zod";

export const createMerchantReferralInputSchema = z.object({
  trackingId: z.string().min(1, "Tracking ID is required"),
  merchantEmail: z.string().email("Valid email is required"),
  merchantCountry: z.string().length(2, "Country code must be 2 characters (ISO 3166-1 alpha-2)").optional(),
  preferredLanguage: z.string().optional(),
  returnUrl: z.string().url("Valid return URL is required"),
  returnUrlDescription: z.string().optional(),
  logoUrl: z.string().url().optional(),

  // Business entity (optional prefill)
  businessName: z.string().optional(),
  businessType: z.enum(["INDIVIDUAL", "PROPRIETORSHIP", "PARTNERSHIP", "CORPORATION", "NONPROFIT", "GOVERNMENT"]).optional(),
  businessWebsite: z.string().url().optional(),

  // Payment methods to enable
  enablePPCP: z.boolean().default(true),
  enableApplePay: z.boolean().default(true),
  enableGooglePay: z.boolean().default(true),
  enableVaulting: z.boolean().default(true),
});

export type CreateMerchantReferralInput = z.infer<typeof createMerchantReferralInputSchema>;
