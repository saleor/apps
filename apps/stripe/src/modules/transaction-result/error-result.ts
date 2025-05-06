import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { AuthroizationFailureBase, ChargeFailureBase } from "./failure-result";

export class ChargeErrorResult extends ChargeFailureBase {
  readonly saleorEventAmount: number;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super({
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeEnv: args.stripeEnv,
    });

    this.saleorEventAmount = args.saleorEventAmount;
  }
}

export class AuthorizationErrorResult extends AuthroizationFailureBase {
  readonly saleorEventAmount: number;

  constructor(args: {
    saleorEventAmount: number;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super({
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeEnv: args.stripeEnv,
    });
    this.saleorEventAmount = args.saleorEventAmount;
  }
}
