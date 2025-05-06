import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { ResultBase } from "@/modules/transaction-result/types";

export class ChargeFailureBase extends ResultBase {
  readonly result = "CHARGE_FAILURE" as const;
  readonly actions = ["CHARGE"] as const;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class ChargeFailureResult extends ChargeFailureBase {
  readonly message = "Payment intent was cancelled";

  readonly saleorMoney: SaleorMoney;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super({
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeEnv: args.stripeEnv,
    });

    this.saleorMoney = args.saleorMoney;
  }
}

export class AuthroizationFailureBase extends ResultBase {
  readonly result = "AUTHORIZATION_FAILURE" as const;
  readonly actions = [] as const;
  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);
    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class AuthorizationFailureResult extends AuthroizationFailureBase {
  readonly message = "Payment intent was cancelled";

  readonly saleorMoney: SaleorMoney;

  constructor(args: {
    saleorMoney: SaleorMoney;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
  }) {
    super({
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeEnv: args.stripeEnv,
    });

    this.saleorMoney = args.saleorMoney;
  }
}
