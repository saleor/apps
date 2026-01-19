import { z } from "zod";

import { PayPalClientId } from "@/modules/paypal/paypal-client-id";
import { PayPalClientSecret } from "@/modules/paypal/paypal-client-secret";

export const newPayPalConfigInputSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  environment: z.enum(["SANDBOX", "LIVE"]),
});

export type NewPayPalConfigInput = z.infer<typeof newPayPalConfigInputSchema>;
