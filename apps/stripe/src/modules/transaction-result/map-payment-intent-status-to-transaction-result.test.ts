import { describe, expect, it } from "vitest";

import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";
import { mapPaymentIntentStatusToTransactionResult } from "./map-payment-intent-status-to-transaction-result";
import { AuthorizationRequestResult, ChargeRequestResult } from "./request-result";
import { AuthorizationSuccessResult, ChargeSuccessResult } from "./success-result";

describe("mapPaymentIntentStatusToAppResult", () => {
  describe("for CHARGE flow", () => {
    const resolvedTransactionFlow = createResolvedTransactionFlow("CHARGE");

    it.each([
      {
        status: "succeeded",
        expectedResult: ChargeSuccessResult,
      },
      {
        status: "requires_payment_method",
        expectedResult: ChargeActionRequiredResult,
      },
      {
        status: "requires_confirmation",
        expectedResult: ChargeActionRequiredResult,
      },
      {
        status: "requires_action",
        expectedResult: ChargeActionRequiredResult,
      },
      {
        status: "processing",
        expectedResult: ChargeRequestResult,
      },
      {
        status: "canceled",
        expectedResult: ChargeActionRequiredResult,
      },
    ])(
      "maps Stripe PaymentIntent status: $status to transactionResult: $expectedResult.name",
      ({ status, expectedResult }) => {
        const stripeStatus = createStripePaymentIntentStatus(status);
        const result = mapPaymentIntentStatusToTransactionResult(
          stripeStatus,
          resolvedTransactionFlow,
        );

        expect(result).toBeInstanceOf(expectedResult);
      },
    );
  });

  describe("for AUTHORIZATION flow", () => {
    const resolvedTransactionFlow = createResolvedTransactionFlow("AUTHORIZATION");

    it.each([
      {
        status: "succeeded",
        expectedResult: ChargeSuccessResult,
      },
      {
        status: "requires_payment_method",
        expectedResult: AuthorizationActionRequiredResult,
      },
      {
        status: "requires_confirmation",
        expectedResult: AuthorizationActionRequiredResult,
      },
      {
        status: "requires_action",
        expectedResult: AuthorizationActionRequiredResult,
      },
      {
        status: "processing",
        expectedResult: AuthorizationRequestResult,
      },
      {
        status: "canceled",
        expectedResult: AuthorizationActionRequiredResult,
      },
      {
        status: "requires_capture",
        expectedResult: AuthorizationSuccessResult,
      },
    ])(
      "maps Stripe status: $status to transactionResult: $expectedResult.name",
      ({ status, expectedResult }) => {
        const stripeStatus = createStripePaymentIntentStatus(status);
        const result = mapPaymentIntentStatusToTransactionResult(
          stripeStatus,
          resolvedTransactionFlow,
        );

        expect(result).toBeInstanceOf(expectedResult);
      },
    );
  });
});
