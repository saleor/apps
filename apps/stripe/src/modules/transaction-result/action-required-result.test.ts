import { describe, expect, it } from "vitest";

import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";

describe("ChargeActionRequiredResult", () => {
  it.each([
    { stripeStatus: "requires_action", expectedMessage: "Payment intent requires action" },
    {
      stripeStatus: "requires_confirmation",
      expectedMessage: "Payment intent requires confirmation",
    },
    {
      stripeStatus: "requires_payment_method",
      expectedMessage: "Payment intent requires payment method",
    },
  ])(
    "should create instance with message: $expectedMessage for Stripe status:$stripeStatus",
    ({ stripeStatus, expectedMessage }) => {
      const result = new ChargeActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus(stripeStatus),
        stripeEnv: "LIVE",
      });

      expect(result.message).toBe(expectedMessage);
    },
  );

  it("should throw error for unsupported status", () => {
    expect(() => {
      new ChargeActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus("succeeded"),
        stripeEnv: "LIVE",
      });
    }).toThrow(
      "Payment intent status succeeded is not supported for CHARGE_ACTION_REQUIRED transaction flow",
    );
  });
});

describe("AuthorizationActionRequiredResult", () => {
  it.each([
    { stripeStatus: "requires_action", expectedMessage: "Payment intent requires action" },
    {
      stripeStatus: "requires_confirmation",
      expectedMessage: "Payment intent requires confirmation",
    },
    {
      stripeStatus: "requires_payment_method",
      expectedMessage: "Payment intent requires payment method",
    },
  ])(
    "should create instance with message: $expectedMessage for Stripe status:$stripeStatus",
    ({ stripeStatus, expectedMessage }) => {
      const result = new AuthorizationActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus(stripeStatus),
        stripeEnv: "LIVE",
      });

      expect(result.message).toBe(expectedMessage);
    },
  );

  it("should throw error for unsupported status", () => {
    expect(() => {
      new AuthorizationActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus("succeeded"),
        stripeEnv: "LIVE",
      });
    }).toThrow(
      "Payment intent status succeeded is not supported for AUTHORIZATION_ACTION_REQUIRED transaction flow",
    );
  });
});
