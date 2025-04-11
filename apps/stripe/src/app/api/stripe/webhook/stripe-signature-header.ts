import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

export const stripeSignatureHeader = "stripe-signature";

export const MissingStripeHeaderError = BaseError.subclass("MissingStripeHeaderError", {
  props: {
    _internalName: "MissingStripeHeaderError",
  },
});

export function getAndParseStripeSignatureHeader(
  headers: Headers,
): Result<string, InstanceType<typeof MissingStripeHeaderError>> {
  const signatureHeader = headers.get(stripeSignatureHeader);

  if (signatureHeader && signatureHeader.length > 0) {
    return ok(signatureHeader);
  } else {
    return err(new MissingStripeHeaderError("Stripe-Signature header is invalid"));
  }
}
