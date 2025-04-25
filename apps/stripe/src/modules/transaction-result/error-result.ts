import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export class ChargeErrorResult {
  readonly result = "CHARGE_FAILURE" as const;

  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorEventAmount: number; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationErrorResult {
  readonly result = "AUTHORIZATION_FAILURE" as const;

  readonly saleorEventAmount: number;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorEventAmount: number; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorEventAmount = args.saleorEventAmount;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
