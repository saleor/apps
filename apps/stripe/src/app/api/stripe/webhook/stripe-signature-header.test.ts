import { describe, expect, it } from "vitest";

import {
  getAndParseStripeSignatureHeader,
  stripeSignatureHeader,
} from "@/app/api/stripe/webhook/stripe-signature-header";

describe("getAndParseStripeSignatureHeader", () => {
  it("Returns raw value from headers", () => {
    expect(
      getAndParseStripeSignatureHeader(
        new Headers({
          [stripeSignatureHeader]: "AABBCC",
        }),
      )._unsafeUnwrap(),
    ).toStrictEqual("AABBCC");
  });

  it("Throws if value is missing", () => {
    expect(
      getAndParseStripeSignatureHeader(new Headers({}))._unsafeUnwrapErr(),
    ).toMatchInlineSnapshot(`[MissingStripeHeaderError: Stripe-Signature header is invalid]`);
  });

  it("Throws if value is empty", () => {
    expect(
      getAndParseStripeSignatureHeader(
        new Headers({
          [stripeSignatureHeader]: "",
        }),
      )._unsafeUnwrapErr(),
    ).toMatchInlineSnapshot(`[MissingStripeHeaderError: Stripe-Signature header is invalid]`);
  });
});
