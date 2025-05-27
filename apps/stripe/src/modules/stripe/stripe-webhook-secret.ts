import { captureMessage } from "@sentry/nextjs";
import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripeWebhookSecretValidationError = BaseError.subclass(
  "StripeWebhookSecretValidationError",
  {
    props: {
      _internalName: "StripeWebhookSecretValidationError" as const,
    },
  },
);

export const StripeWebhookSecretSchema = z
  .string()
  .min(1)
  .refine((v) => {
    if (!v.startsWith("whsec_")) {
      captureMessage("Received unexpected Stripe Webhook Secret format", (scope) => {
        scope.setLevel("warning");
        scope.setExtra("first4letters", v.slice(0, 4));

        return scope;
      });
    }

    return true;
  })
  .brand("StripeWebhookSecret");

export const createStripeWebhookSecret = (raw: string | null) =>
  fromThrowable(StripeWebhookSecretSchema.parse, (error) =>
    StripeWebhookSecretValidationError.normalize(error),
  )(raw);

export type StripeWebhookSecret = z.infer<typeof StripeWebhookSecretSchema>;
