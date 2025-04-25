import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

export class ChargeActionRequiredResult {
  readonly result = "CHARGE_ACTION_REQUIRED" as const;
  readonly actions = [] as const;

  readonly saleorMoney: SaleorMoney;
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
          `Payment intent status ${stripeStatus} is not supported for CHARGE_ACTION_REQUIRED transaction flow`,
        );
    }
  }

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
  }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.message = this.getMessageFromStripeStatus(args.stripeStatus);
  }
}

export class AuthorizationActionRequiredResult {
  readonly result = "AUTHORIZATION_ACTION_REQUIRED" as const;
  readonly actions = [] as const;

  readonly saleorMoney: SaleorMoney;
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
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeStatus: StripePaymentIntentStatus;
  }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.message = this.getMessageFromStripeStatus(args.stripeStatus);
  }
}
