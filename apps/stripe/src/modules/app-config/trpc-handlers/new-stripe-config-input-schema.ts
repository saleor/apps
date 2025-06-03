import { z } from "zod";

import {
  createStripePublishableKey,
  StripePublishableKey,
} from "@/modules/stripe/stripe-publishable-key";
import {
  createStripeRestrictedKey,
  StripeRestrictedKey,
} from "@/modules/stripe/stripe-restricted-key";

export const newStripeConfigInputSchema = z
  .object({
    name: z.string().min(1),
    publishableKey: z.string().transform((value, ctx): StripePublishableKey => {
      const validPrefix = value.startsWith("pk_test_") || value.startsWith("pk_live_");

      if (!validPrefix) {
        ctx.addIssue({
          message: "Invalid Publishable Key format. Must start with 'pk_test_' or 'pk_live_'.",
          code: z.ZodIssueCode.custom,
        });

        return z.NEVER;
      }

      return createStripePublishableKey(value).match(
        (parsed) => parsed,
        () => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Publishable Key format",
          });

          return z.NEVER;
        },
      );
    }),
    restrictedKey: z.string().transform((value, ctx): StripeRestrictedKey => {
      const validPrefix = value.startsWith("rk_test_") || value.startsWith("rk_live_");

      if (!validPrefix) {
        ctx.addIssue({
          message: "Invalid Restricted Key format. Must start with 'pk_test_' or 'pk_live_'.",
          code: z.ZodIssueCode.custom,
        });

        return z.NEVER;
      }

      return createStripeRestrictedKey(value).match(
        (parsed) => parsed,
        () => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Restricted Key format",
          });

          return z.NEVER;
        },
      );
    }),
  })
  .refine(
    (values) => {
      const isPkTest = values.publishableKey.startsWith("pk_test");
      const isPkLive = values.publishableKey.startsWith("pk_live");
      const isRkTest = values.restrictedKey.startsWith("rk_test");
      const isRkLive = values.restrictedKey.startsWith("rk_live");

      const isBothTest = isRkTest && isPkTest;
      const isBothLive = isRkLive && isPkLive;

      const isBothTestOrLive = isBothTest || isBothLive;

      return isBothTestOrLive;
    },
    {
      message: "Both Publishable and Restricted Keys must be live or test",
    },
  );

export type NewStripeConfigInput = z.infer<typeof newStripeConfigInputSchema>;
