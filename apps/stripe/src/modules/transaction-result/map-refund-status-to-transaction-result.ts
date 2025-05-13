import { assertUnreachable } from "@/lib/assert-unreachable";

import { StripeRefundStatus } from "../stripe/stripe-refund-status";
import { RefundFailureResult, RefundRequestResult, RefundSuccessResult } from "./refund-result";

export const mapRefundStatusToTransactionResult = (stripeRefundStatus: StripeRefundStatus) => {
  switch (stripeRefundStatus) {
    case "succeeded":
      return new RefundSuccessResult();
    case "pending":
    case "requires_action":
      return new RefundRequestResult();
    case "failed":
    case "canceled":
      return new RefundFailureResult();
    default:
      assertUnreachable(stripeRefundStatus);
  }
};
