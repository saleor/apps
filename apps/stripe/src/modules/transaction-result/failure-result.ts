import { StripeEnv } from "../stripe/stripe-env";
import { StripePaymentIntentId } from "../stripe/stripe-payment-intent-id";
import { ResultBase } from "./types";

export class ChargeFailureResult extends ResultBase {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;
  readonly message = "Payment intent was cancelled";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationFailureResult extends ResultBase {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent was cancelled";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
