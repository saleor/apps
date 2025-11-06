import { z } from "zod";

export const wsmAdminAuthSchema = z.object({
  secretKey: z.string().min(1, "Secret key is required"),
});

export const setGlobalConfigInputSchema = wsmAdminAuthSchema.extend({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  partnerMerchantId: z.string().optional(),
  partnerFeePercent: z.number().min(0).max(100).optional(),
  bnCode: z.string().optional(),
  environment: z.enum(["SANDBOX", "LIVE"]),
});

export const testCredentialsInputSchema = z.object({
  secretKey: z.string().min(1, "Secret key is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  environment: z.enum(["SANDBOX", "LIVE"]),
});
