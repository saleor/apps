import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

/**
 * Holds transaction that app records during it's lifetime.
 * Usually it's mainly used for persisting pair of Saleor reference (Transaction ID) and Stripe reference (PaymentIntent ID).
 */
export class RecordedTransaction {
  readonly saleorTransactionId: string;

  readonly stripePaymentIntentId: StripePaymentIntentId;

  constructor(saleorTransactionId: string, stripePaymentIntentId: StripePaymentIntentId) {
    this.saleorTransactionId = saleorTransactionId;
    this.stripePaymentIntentId = stripePaymentIntentId;
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
