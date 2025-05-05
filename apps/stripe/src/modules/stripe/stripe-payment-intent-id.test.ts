import { describe, expect, it } from "vitest";

import { createStripePaymentIntentId } from "./stripe-payment-intent-id";

describe("createStripePaymentIntentId", () => {
  it("should successfully create Stripe payment intent id when valid", () => {
    const result = createStripePaymentIntentId("pi_valid123");

    expect(result).toBe("pi_valid123");
  });

  it("should return error when payment intent id is empty", () => {
    expect(() => createStripePaymentIntentId("")).toThrowError();
  });

  it("should return error when payment intent id does not start with pi_", () => {
    expect(() => createStripePaymentIntentId("invalid123")).toThrowError();
  });

  it("shouldn't be assignable without createStripePaymentIntentId", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: StripePaymentIntentIdType = "";

    expect(testValue).toBe("");
  });
});
