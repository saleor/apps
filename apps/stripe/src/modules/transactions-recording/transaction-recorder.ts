import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { TransactionFlow } from "@/modules/transaction-flow";

/**
 * Holds transaction that app records during it's lifetime.
 * Usually it's mainly used for persisting pair of Saleor reference (Transaction ID) and Stripe reference (PaymentIntent ID).
 *
 * TODO: Add some flag like "processed: boolean" to handle deduplication
 * TODO: Persistence should not allow overwrites - it's invariant if we try to save the same data twice
 */
export class RecordedTransaction {
  readonly saleorTransactionId: string;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly saleorTransactionFlow: TransactionFlow;
  readonly resolvedTransactionFlow: TransactionFlow;
  readonly selectedPaymentMethod: PaymentMethod["type"];

  constructor(args: {
    saleorTransactionId: string;
    stripePaymentIntentId: StripePaymentIntentId;
    saleorTransactionFlow: TransactionFlow;
    resolvedTransactionFlow: TransactionFlow;
    selectedPaymentMethod: PaymentMethod["type"];
  }) {
    this.saleorTransactionId = args.saleorTransactionId;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.saleorTransactionFlow = args.saleorTransactionFlow;
    this.resolvedTransactionFlow = args.resolvedTransactionFlow;
    this.selectedPaymentMethod = args.selectedPaymentMethod;
  }
}

export const TransactionRecorderError = {
  PersistenceNotAvailable: BaseError.subclass("TransactionRecorder.PersistenceNotAvailableError", {
    props: {
      _internalName: "TransactionRecorder.PersistenceNotAvailableError",
    },
  }),
  /**
   * Current assumption is that transaction MUST exist before reading it.
   * If not, it's something wrong with the business logic
   */
  TransactionMissingError: BaseError.subclass("TransactionRecorder.TransactionMissingError", {
    props: {
      _internalName: "TransactionRecorder.TransactionMissingError",
    },
  }),
};

export type TransactionRecorderError = InstanceType<
  | typeof TransactionRecorderError.PersistenceNotAvailable
  | typeof TransactionRecorderError.TransactionMissingError
>;

export interface TransactionRecorder {
  recordTransaction(
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>>;

  getTransactionByStripePaymentIntentId(
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>>;
}
