import { describe, expect, it } from "vitest";

import { createStripeRefundStatus } from "../stripe/stripe-refund-status";
import { mapRefundStatusToTransactionResult } from "./map-refund-status-to-transaction-result";
import { RefundFailureResult, RefundRequestResult, RefundSuccessResult } from "./refund-result";

describe("mapRefundStatusToTransactionResult", () => {
  it.each([
    { status: "succeeded", expectedResult: RefundSuccessResult },
    { status: "failed", expectedResult: RefundFailureResult },
    { status: "canceled", expectedResult: RefundFailureResult },
    { status: "pending", expectedResult: RefundRequestResult },
    { status: "requires_action", expectedResult: RefundRequestResult },
  ])(
    "maps Stripe Refund status: $status to transactionResult: $expectedResult.name",
    ({ status, expectedResult }) => {
      const stripeStatus = createStripeRefundStatus(status);
      const result = mapRefundStatusToTransactionResult(stripeStatus);

      expect(result).toBeInstanceOf(expectedResult);
    },
  );
});
