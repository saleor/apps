import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { TransactionFlow } from "@/modules/transaction-flow";

/**
 * Holds transaction that app records during it's lifetime.
 * Usually it's mainly used for persisting pair of Saleor reference (Transaction ID) and Stripe reference (PaymentIntent ID).
 *
 * TODO: Add some flag like "processed: boolean" to handle deduplication
 */
export class RecordedTransaction {
  readonly saleorTransactionId: string;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly transactionFlow: TransactionFlow;

  constructor(
    saleorTransactionId: string,
    stripePaymentIntentId: StripePaymentIntentId,
    transactionFlow: TransactionFlow,
  ) {
    this.saleorTransactionId = saleorTransactionId;
    this.stripePaymentIntentId = stripePaymentIntentId;
    this.transactionFlow = transactionFlow;
  }
}

export const TransactionRecorderError = {
  PersistenceNotAvailable: BaseError.subclass("TransactionRecorder.PersistenceNotAvailableError", {
    props: {
      _internalName: "TransactionRecorder.PersistenceNotAvailableError",
    },
  }),
};

export type TransactionRecorderError = InstanceType<
  typeof TransactionRecorderError.PersistenceNotAvailable
>;

export interface TransactionRecorder {
  recordTransaction(
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>>;

  getTransactionByStripePaymentIntentId(
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>>;
}
