import { captureMessage } from "@sentry/nextjs";
import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripeRestrictedKeyValidationError = BaseError.subclass(
  "StripeRestrictedKeyValidationError",
  {
    props: {
      _internalName: "StripeRestrictedKeyValidationError" as const,
    },
  },
);

export const StripeRestrictedKeySchema = z
  .string()
  .min(1)
  .refine((value) => {
    const expected = value.startsWith("rk_test_") || value.startsWith("rk_live_");

    if (!expected) {
      captureMessage("Received unexpected Stripe PK format", (scope) => {
        scope.setLevel("warning");
        scope.setExtra("first8letters", value.slice(0, 8));

        return scope;
      });
    }

    return true;
  })
  .brand("StripeRestrictedKey");

export const createStripeRestrictedKey = (raw: string | null) =>
  fromThrowable(StripeRestrictedKeySchema.parse, (error) =>
    StripeRestrictedKeyValidationError.normalize(error),
  )(raw);

export type StripeRestrictedKey = z.infer<typeof StripeRestrictedKeySchema>;
