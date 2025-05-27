import { captureMessage } from "@sentry/nextjs";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripePaymentIntentValidationError = BaseError.subclass(
  "StripePaymentIntentValidationError",
  {
    props: {
      _internalName: "StripePaymentIntentValidationError" as const,
    },
  },
);

const StripePaymentIntentIdSchema = z
  .string({
    required_error: "Payment intent id is required",
  })
  .min(1)
  .refine((v) => {
    if (!v.startsWith("pi_")) {
      captureMessage("Received unexpected Stripe Payment Intent ID format", (scope) => {
        scope.setLevel("warning");
        scope.setExtra("stripePaymentIntentId", v);

        return scope;
      });
    }

    return true;
  })
  .brand("StripePaymentIntentId");

export const createStripePaymentIntentId = (raw: string) => StripePaymentIntentIdSchema.parse(raw);

export type StripePaymentIntentId = z.infer<typeof StripePaymentIntentIdSchema>;
