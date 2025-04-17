import { err, fromThrowable, ok, Result } from "neverthrow";
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
    return value.startsWith("pk_test_") || value.startsWith("pk_live_");
  })
  .brand("StripePublishableKey");

export const createStripePublishableKey = (raw: string | null) =>
  fromThrowable(StripePublishableKeySchema.parse, (error) =>
    StripePublishableKeyValidationError.normalize(error),
  )(raw);

export type StripePublishableKey = z.infer<typeof StripePublishableKeySchema>;
