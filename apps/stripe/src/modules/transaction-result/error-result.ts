import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ResultBase } from "@/modules/transaction-result/types";

// todo this is duplicated with FailureResult
export class ChargeErrorResult extends ResultBase {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;

  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);

    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationErrorResult extends ResultBase {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;

  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
