import { BaseError } from "@/lib/errors";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

export class ChargeActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;

  readonly message: string;

  private getMessageFromStripeStatus(stripeStatus: StripePaymentIntentStatus) {
    switch (stripeStatus) {
      case "requires_action":
        return "Payment intent requires action";
      case "requires_confirmation":
        return "Payment intent requires confirmation";
      case "requires_payment_method":
        return "Payment intent requires payment method";
      case "canceled":
        return "Payment intent was canceled";
      default:
        throw new BaseError(
          `Payment intent status ${stripeStatus} is not supported for CHARGE_ACTION_REQUIRED transaction flow`,
        );
    }
  }

  constructor(stripeStatus: StripePaymentIntentStatus) {
    this.message = this.getMessageFromStripeStatus(stripeStatus);
  }
}

export class AuthorizationActionRequiredResult {
  readonly result = "AUTHORIZATION_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;

  readonly message: string;

  private getMessageFromStripeStatus(stripeStatus: StripePaymentIntentStatus) {
    switch (stripeStatus) {
      case "requires_action":
        return "Payment intent requires action";
      case "requires_confirmation":
        return "Payment intent requires confirmation";
      case "requires_payment_method":
        return "Payment intent requires payment method";
      case "canceled":
        return "Payment intent was canceled";
      default:
        throw new BaseError(
          `Payment intent status ${stripeStatus} is not supported for AUTHORIZATION_ACTION_REQUIRED transaction flow`,
        );
    }
  }

  constructor(stripeStatus: StripePaymentIntentStatus) {
    this.message = this.getMessageFromStripeStatus(stripeStatus);
  }
}
