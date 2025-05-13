import { StripeEnv } from "../stripe/stripe-env";
import { StripeRefundId } from "../stripe/stripe-refund-id";
import { ResultBase } from "./types";

export class RefundSuccessResult extends ResultBase {
  readonly result = "REFUND_SUCCESS" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Refund was successful";

  readonly stripeRefundId: StripeRefundId;

  constructor(args: { stripeRefundId: StripeRefundId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripeRefundId = args.stripeRefundId;
  }
}

export class RefundFailureResult extends ResultBase {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Refund failed";

  readonly stripeRefundId: StripeRefundId;

  constructor(args: { stripeRefundId: StripeRefundId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripeRefundId = args.stripeRefundId;
  }
}

export class RefundRequestResult extends ResultBase {
  readonly result = "REFUND_REQUEST" as const;
  readonly actions = [] as const;
  readonly message = "Refund is processing";

  readonly stripeRefundId: StripeRefundId;

  constructor(args: { stripeRefundId: StripeRefundId; stripeEnv: StripeEnv }) {
    super(args.stripeEnv);

    this.stripeRefundId = args.stripeRefundId;
  }
}
