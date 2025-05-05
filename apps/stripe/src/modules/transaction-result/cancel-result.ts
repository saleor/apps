import { SaleorMoney } from "../saleor/saleor-money";
import { StripeEnv } from "../stripe/stripe-env";
import { StripePaymentIntentId } from "../stripe/stripe-payment-intent-id";
import { ResultBase } from "./types";

export class CancelSuccessResult extends ResultBase {
  readonly result = "CANCEL_SUCCESS" as const;
  readonly actions = [] as const;
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
