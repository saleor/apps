import { captureMessage } from "@sentry/nextjs";
import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripePublishableKeyValidationError = BaseError.subclass(
  "StripePublishableKeyValidationError",
  {
    props: {
      _internalName: "StripePublishableKeyValidationError" as const,
    },
  },
);

export const StripePublishableKeySchema = z
  .string()
  .min(1)
  .refine((value) => {
    const expected = value.startsWith("pk_test_") || value.startsWith("pk_live_");

    if (!expected) {
      captureMessage("Received unexpected Stripe PK format", (scope) => {
        scope.setLevel("warning");
        scope.setExtra("first8letters", value.slice(0, 8));

        return scope;
      });
    }

    return true;
  })
  .brand("StripePublishableKey");

export const createStripePublishableKey = (raw: string | null) =>
  fromThrowable(StripePublishableKeySchema.parse, (error) =>
    StripePublishableKeyValidationError.normalize(error),
  )(raw);

export type StripePublishableKey = z.infer<typeof StripePublishableKeySchema>;
