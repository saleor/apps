import { z } from "zod";

import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";

export const newStripeConfigSchema = z.object({
  name: z.string().min(1),
  publishableKey: z.string().transform((value, ctx) => {
    return StripePublishableKey.create({
      publishableKey: value,
    }).match(
      (parsed) => parsed,
      () => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Publishable Key format, it should start with pk_live or pk_test",
        });
      },
    );
  }),
});