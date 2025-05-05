import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ResultBase } from "@/modules/transaction-result/types";

export class ChargeFailureResult extends ResultBase {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;
  readonly message = "Payment intent was cancelled";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);

    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationFailureResult extends ResultBase {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = ["CANCEL"] as const;
  readonly message = "Payment intent was cancelled";

  readonly saleorMoney: SaleorMoney;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super(args.stripeEnv);

    this.saleorMoney = args.saleorMoney;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
