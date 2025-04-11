import { describe, expect, it } from "vitest";

import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

describe("StripeWebhookSecret", () => {
  it("Creates from valid string", () => {
    expect(StripeWebhookSecret.create("whsec_XYZ")._unsafeUnwrap()).toBeInstanceOf(
      StripeWebhookSecret,
    );
  });

  it.each(["", "test"])("Throws if invalid value passed: %s", (value) => {
    expect(StripeWebhookSecret.create(value)._unsafeUnwrapErr()).toBeInstanceOf(
      StripeWebhookSecret.ValidationError,
    );
  });
});
