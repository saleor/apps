import { assertUnreachable } from "@/lib/assert-unreachable";
import { ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";
import { AuthorizationFailureResult, ChargeFailureResult } from "./failure-result";
import { AuthorizationRequestResult, ChargeRequestResult } from "./request-result";
import { AuthorizationSuccessResult, ChargeSuccessResult } from "./success-result";

export const mapPaymentIntentStatusToTransactionResult = (
  stripePaymentIntentStatus: StripePaymentIntentStatus,
  resolvedTransationFlow: ResolvedTransationFlow,
) => {
  switch (stripePaymentIntentStatus) {
    case "succeeded":
      return ChargeSuccessResult;

    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
      if (resolvedTransationFlow === "CHARGE") {
        return ChargeActionRequiredResult;
      }

      return AuthorizationActionRequiredResult;
    case "processing":
      if (resolvedTransationFlow === "CHARGE") {
        return ChargeRequestResult;
      }

      return AuthorizationRequestResult;
    case "canceled":
      if (resolvedTransationFlow === "CHARGE") {
        return ChargeFailureResult;
      }

      return AuthorizationFailureResult;
    case "requires_capture":
      return AuthorizationSuccessResult;
    default:
      assertUnreachable(stripePaymentIntentStatus);
  }
};
