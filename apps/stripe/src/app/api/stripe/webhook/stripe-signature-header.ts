import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

const stripeSignatureHeader = "stripe-signature";

export const MissingStripeHeaderError = BaseError.subclass("MissingStripeHeaderError", {
  props: {
    _internalName: "MissingStripeHeaderError",
  },
});

// todo test
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
