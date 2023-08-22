import { OrderRefundedPayload } from "../../../pages/api/webhooks/order-refunded";
import { RefundTransactionParams } from "../avatax-client";

export class AvataxOrderRefundedLinesTransformer {
  transform(payload: OrderRefundedPayload): RefundTransactionParams["lines"] {
    const refundTransactions =
      payload.order?.transactions.filter((t) => t.refundedAmount.amount > 0) ?? [];

    if (!refundTransactions.length) {
      throw new Error("Cannot refund order without any refund transactions");
    }

    return refundTransactions.map((t) => ({
      amount: -t.refundedAmount.amount,
      taxIncluded: true,
    }));
  }
}
