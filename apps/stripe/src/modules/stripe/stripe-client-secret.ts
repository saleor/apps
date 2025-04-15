import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const StripeClientSecretValidationError = BaseError.subclass(
  "StripeClientSecretValidationError",
  {
    props: {
      _internalName: "StripeClientSecretValidationError" as const,
    },
  },
);

export const StripeClientSecretSchema = z.string().min(1).brand("StripeClientSecret");

export const createStripeClientSecret = (raw: string | null) =>
  fromThrowable(StripeClientSecretSchema.parse, (error) =>
    StripeClientSecretValidationError.normalize(error),
  )(raw);

export type StripeClientSecret = z.infer<typeof StripeClientSecretSchema>;
