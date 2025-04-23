import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripePaymentIntentStatusValidationError = BaseError.subclass(
  "StripePaymentIntentStatusValidationError",
  {
    props: {
      _internalName: "StripePaymentIntentStatusValidationError" as const,
    },
  },
);

const StripePaymentIntentStatusSchema = z
  .enum([
    "requires_action",
    "requires_confirmation",
    "requires_payment_method",
    "canceled",
    "processing",
    "requires_capture",
    "succeeded",
  ])
  .brand("StripePaymentIntentStatus");

export const createStripePaymentIntentStatus = (raw: string) =>
  fromThrowable(StripePaymentIntentStatusSchema.parse, (error) =>
    StripePaymentIntentStatusValidationError.normalize(error),
  )(raw);

export type StripePaymentIntentStatus = z.infer<typeof StripePaymentIntentStatusSchema>;
