import { BaseError } from "@/lib/errors";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import { ResultBase } from "@/modules/transaction-result/types";

export class ChargeActionRequiredResult extends ResultBase {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;

  readonly stripePaymentIntentId: StripePaymentIntentId;
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

  constructor(args: {
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.message = this.getMessageFromStripeStatus(args.stripeStatus);
  }
}

export class AuthorizationActionRequiredResult extends ResultBase {
  readonly result = "AUTHORIZATION_ACTION_REQUIRED" as const;
  readonly actions = ["CANCEL"] as const;

  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly message: string;

  private getMessageFromStripeStatus(stripeStatus: StripePaymentIntentStatus) {
    switch (stripeStatus) {
      case "requires_action":
        return "Payment intent requires action";
      case "requires_confirmation":
        return "Payment intent requires confirmation";
      case "requires_payment_method":
        return "Payment intent requires payment method";
      default:
        throw new BaseError(
          `Payment intent status ${stripeStatus} is not supported for AUTHORIZATION_ACTION_REQUIRED transaction flow`,
        );
    }
  }

  constructor(args: {
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.message = this.getMessageFromStripeStatus(args.stripeStatus);
  }
}
