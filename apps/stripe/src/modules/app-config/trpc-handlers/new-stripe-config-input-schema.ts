import { z } from "zod";

import {
  keysShareEnvironment,
  MIXED_KEY_ENVIRONMENTS_MESSAGE,
  stripePublishableKeyInputSchema,
  stripeRestrictedKeyInputSchema,
} from "@/modules/app-config/trpc-handlers/stripe-key-input-schemas";

export const newStripeConfigInputSchema = z
  .object({
    name: z.string().min(1),
    publishableKey: stripePublishableKeyInputSchema,
    restrictedKey: stripeRestrictedKeyInputSchema,
  })
  .refine(keysShareEnvironment, {
    message: MIXED_KEY_ENVIRONMENTS_MESSAGE,
  });

export type NewStripeConfigInput = z.infer<typeof newStripeConfigInputSchema>;
