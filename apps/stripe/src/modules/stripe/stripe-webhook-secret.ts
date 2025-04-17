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
  .startsWith("whsec_")
  .brand("StripeWebhookSecretSchema");

export const createStripeWebhookSecret = (raw: string | null) =>
  fromThrowable(StripeWebhookSecretSchema.parse, (error) =>
    StripeWebhookSecretValidationError.normalize(error),
  )(raw);

export type StripeWebhookSecret = z.infer<typeof StripeWebhookSecretSchema>;
