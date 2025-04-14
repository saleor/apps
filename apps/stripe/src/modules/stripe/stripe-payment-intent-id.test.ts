import { describe, expect, it } from "vitest";

import {
  createStripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "./stripe-payment-intent-id";

describe("createStripePaymentIntentId", () => {
  it("should successfully create Stripe payment intent id when valid", () => {
    const result = createStripePaymentIntentId("pi_valid123");

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe("pi_valid123");
  });

  it("should return error when payment intent id is empty", () => {
    const result = createStripePaymentIntentId("");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripePaymentIntentValidationError);
  });

  it("should return error when payment intent id does not start with pi_", () => {
    const result = createStripePaymentIntentId("invalid123");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripePaymentIntentValidationError);
  });
});
