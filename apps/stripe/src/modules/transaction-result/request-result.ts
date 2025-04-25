import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export class ChargeRequestResult {
  readonly result = "CHARGE_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent is processing";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationRequestResult {
  readonly result = "AUTHORIZATION_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent is processing";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
