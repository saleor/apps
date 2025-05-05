import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ResultBase } from "@/modules/transaction-result/types";

export class ChargeRequestResult extends ResultBase {
  readonly result = "CHARGE_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent is processing";

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

export class AuthorizationRequestResult extends ResultBase {
  readonly result = "AUTHORIZATION_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Payment intent is processing";

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
