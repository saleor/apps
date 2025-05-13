import { StripeEnv } from "@/modules/stripe/stripe-env";
import { ResultBase } from "@/modules/transaction-result/types";

/*
 * Special case - we don't have a refund id yet, so we can't create a RefundFailureResult
 * TODO: refactor results to not require stripePaymentIntentId
 */
export class TransactionRefundRequestedFailureResult extends ResultBase {
  readonly result = "REFUND_FAILURE" as const;
  readonly actions = ["REFUND"] as const;
  readonly message = "Refund failed";

  constructor(args: { stripeEnv: StripeEnv }) {
    super(args.stripeEnv);
  }
}
