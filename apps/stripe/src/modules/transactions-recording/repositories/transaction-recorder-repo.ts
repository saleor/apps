import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/recorded-transaction";

export const TransactionRecorderError = {
  PersistenceNotAvailable: BaseError.subclass(
    "TransactionRecorderRepo.PersistenceNotAvailableError",
    {
      props: {
        _internalName: "TransactionRecorderRepo.PersistenceNotAvailableError",
      },
    },
  ),
  /**
   * Current assumption is that transaction MUST exist before reading it.
   * If not, it's something wrong with the business logic
   */
  TransactionMissingError: BaseError.subclass("TransactionRecorderRepo.TransactionMissingError", {
    props: {
      _internalName: "TransactionRecorderRepo.TransactionMissingError",
    },
  }),
};

export type TransactionRecorderError = InstanceType<
  | typeof TransactionRecorderError.PersistenceNotAvailable
  | typeof TransactionRecorderError.TransactionMissingError
>;

export interface TransactionRecorderRepo {
  recordTransaction(
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>>;

  getTransactionByStripePaymentIntentId(
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>>;
}
