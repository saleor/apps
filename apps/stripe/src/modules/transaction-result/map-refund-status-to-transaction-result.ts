import { assertUnreachable } from "@/lib/assert-unreachable";

import { StripeRefundStatus } from "../stripe/stripe-refund-status";
import { RefundFailureResult, RefundRequestResult, RefundSuccessResult } from "./refund-result";

export const mapRefundStatusToTransactionResult = (stripeRefundStatus: StripeRefundStatus) => {
  switch (stripeRefundStatus) {
    case "succeeded":
      return RefundSuccessResult;
    case "pending":
    case "requires_action":
      return RefundRequestResult;
    case "failed":
    case "canceled":
      return RefundFailureResult;
    default:
      assertUnreachable(stripeRefundStatus);
  }
};
