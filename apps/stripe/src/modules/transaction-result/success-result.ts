import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ResultBase } from "@/modules/transaction-result/types";

export class ChargeSuccessResult extends ResultBase {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent succeeded";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationSuccessResult extends ResultBase {
  readonly result = "AUTHORIZATION_SUCCESS" as const;
  readonly actions = ["CHARGE", "CANCEL"] as const;
  readonly message = "Payment intent succeeded";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
