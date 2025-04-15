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

const StripePaymentIntentIdSchema = z
  .string({
    required_error: "Payment intent id is required",
  })
  .startsWith("pi_")
  .brand("StripePaymentIntentId");

export const createStripePaymentIntentId = (raw: string) =>
  fromThrowable(StripePaymentIntentIdSchema.parse, (error) =>
    StripePaymentIntentValidationError.normalize(error),
  )(raw);

export type StripePaymentIntentId = z.infer<typeof StripePaymentIntentIdSchema>;
