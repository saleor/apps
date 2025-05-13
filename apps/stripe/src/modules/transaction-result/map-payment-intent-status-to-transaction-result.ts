import { assertUnreachable } from "@/lib/assert-unreachable";
import { ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";
import { AuthorizationRequestResult, ChargeRequestResult } from "./request-result";
import { AuthorizationSuccessResult, ChargeSuccessResult } from "./success-result";

export const mapPaymentIntentStatusToTransactionResult = (
  stripePaymentIntentStatus: StripePaymentIntentStatus,
  resolvedTransactionFlow: ResolvedTransactionFlow,
) => {
  switch (stripePaymentIntentStatus) {
    case "succeeded":
      return new ChargeSuccessResult();

    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "canceled":
      if (resolvedTransactionFlow === "CHARGE") {
        return new ChargeActionRequiredResult(stripePaymentIntentStatus);
      }

      return new AuthorizationActionRequiredResult(stripePaymentIntentStatus);
    case "processing":
      if (resolvedTransactionFlow === "CHARGE") {
        return new ChargeRequestResult();
      }

      return new AuthorizationRequestResult();
    case "requires_capture":
      return new AuthorizationSuccessResult();
    default:
      assertUnreachable(stripePaymentIntentStatus);
  }
};
