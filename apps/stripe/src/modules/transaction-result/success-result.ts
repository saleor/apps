import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

export class ChargeSuccessResult {
  readonly result = "CHARGE_SUCCESS" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Payment intent succeeded";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationSuccessResult {
  readonly result = "AUTHORIZATION_SUCCESS" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "Payment intent succeeded";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { saleorMoney: SaleorMoney; stripePaymentIntentId: StripePaymentIntentId }) {
    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
