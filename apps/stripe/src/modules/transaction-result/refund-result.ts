import { StripeEnv } from "../stripe/stripe-env";
import { StripePaymentIntentId } from "../stripe/stripe-payment-intent-id";
import { ResultBase } from "./types";

export class RefundSuccessResult extends ResultBase {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Refund was successful";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class RefundFailureResult extends ResultBase {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Refund failed";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}

export class RefundRequestResult extends ResultBase {
  readonly result = "REFUND_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Refund is processing";

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(args: { stripePaymentIntentId: StripePaymentIntentId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripePaymentIntentId = args.stripePaymentIntentId;
  }
}
