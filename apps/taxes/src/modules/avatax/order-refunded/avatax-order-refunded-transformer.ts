import { OrderRefundedPayload } from "../../../pages/api/webhooks/order-refunded";
import { RefundTransactionParams } from "../avatax-client";

export class AvataxOrderRefundedLinesTransformer {
  transform(payload: OrderRefundedPayload): RefundTransactionParams["lines"] {
    const transaction = payload.transaction;

    if (!transaction) {
      throw new Error("Insufficient transaction data");
    }

    return [
      // todo: verify
      {
        amount: -transaction.chargedAmount.amount,
        taxIncluded: true,
      },
    ];
  }
}
