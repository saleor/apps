import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { AuthroizationFailureBase, ChargeFailureBase } from "./failure-result";

/**
 * Error result class used when there is an error in Saleor webhook e.g with getting PaymentIntent and we need to send the error back to Saleor
 */
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

/**
 * Error result class used when there is an error in Saleor webhook e.g with getting PaymentIntent and we need to send the error back to Saleor
 */
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
