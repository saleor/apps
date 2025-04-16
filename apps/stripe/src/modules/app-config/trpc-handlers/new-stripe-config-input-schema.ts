import { z } from "zod";

import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

// change value objects to branded strings
export const newStripeConfigInputSchema = z.object({
  name: z.string().min(1),
  publishableKey: z.string().transform((value, ctx): StripePublishableKey => {
    return StripePublishableKey.create({
      publishableKey: value,
    }).match(
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
    return StripeRestrictedKey.create({
      restrictedKey: value,
    }).match(
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
