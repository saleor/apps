import { fromThrowable } from "neverthrow";
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

const stripePaymentIntentIdSchema = z
  .string({
    required_error: "Payment intent id is required",
  })
  .startsWith("pi_")
  .brand("StripePaymentIntentId");

export const createStripePaymentIntentId = (raw: string) =>
  fromThrowable(stripePaymentIntentIdSchema.parse, (error) =>
    StripePaymentIntentValidationError.normalize(error),
  )(raw);

export type StripePaymentIntentIdType = z.infer<typeof stripePaymentIntentIdSchema>;
