import { z } from "zod";

import {
  createStripePublishableKey,
  StripePublishableKey,
} from "@/modules/stripe/stripe-publishable-key";
import {
  createStripeRestrictedKey,
  StripeRestrictedKey,
} from "@/modules/stripe/stripe-restricted-key";

export const newStripeConfigInputSchema = z.object({
  name: z.string().min(1),
  publishableKey: z.string().transform((value, ctx): StripePublishableKey => {
    return createStripePublishableKey(value).match(
      (parsed) => parsed,
      () => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Publishable Key format, it should start with pk_live_ or pk_test_",
        });

        return z.NEVER;
      },
    );
  }),
  restrictedKey: z.string().transform((value, ctx): StripeRestrictedKey => {
    return createStripeRestrictedKey(value).match(
      (parsed) => parsed,
      () => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Restricted Key format, it should start with rk_test_ or rk_live_",
        });

        return z.NEVER;
      },
    );
  }),
});

export type NewStripeConfigInput = z.infer<typeof newStripeConfigInputSchema>;
