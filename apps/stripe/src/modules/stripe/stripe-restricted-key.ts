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
  .refine(
    (value) => {
      return value.startsWith("rk_test_") || value.startsWith("rk_live_");
    },
    {
      message: "Must start with 'rk_test_' or 'rk_live_",
    },
  )
  .brand("StripeRestrictedKey");

export const createStripeRestrictedKey = (raw: string | null) =>
  fromThrowable(StripeRestrictedKeySchema.parse, (error) =>
    StripeRestrictedKeyValidationError.normalize(error),
  )(raw);

export type StripeRestrictedKey = z.infer<typeof StripeRestrictedKeySchema>;
