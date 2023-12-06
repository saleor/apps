import { TransactionRefundRequestedPayload } from "../../../pages/api/webhooks/transaction-refund-requested";
import { RefundTransactionParams } from "../avatax-client";

export class AvataxOrderRefundedLinesTransformer {
  transform(payload: TransactionRefundRequestedPayload): RefundTransactionParams["lines"] {
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
