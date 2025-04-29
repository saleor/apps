import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

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
   * If not, it's something wrong with the business logic - that's why it's not null, but error
   */
  TransactionMissingError: BaseError.subclass("TransactionRecorderRepo.TransactionMissingError", {
    props: {
      _internalName: "TransactionRecorderRepo.TransactionMissingError",
    },
  }),
  FailedWritingTransactionError: BaseError.subclass(
    "TransactionRecorderRepo.FailedWritingTransactionError",
    {
      props: {
        _internalName: "TransactionRecorderRepo.FailedWritingTransactionError",
      },
    },
  ),
  FailedFetchingTransactionError: BaseError.subclass(
    "TransactionRecorderRepo.FailedFetchingTransactionError",
    {
      props: {
        _internalName: "TransactionRecorderRepo.FailedFetchingTransactionError",
      },
    },
  ),
};

export type TransactionRecorderError = InstanceType<
  | typeof TransactionRecorderError.PersistenceNotAvailable
  | typeof TransactionRecorderError.TransactionMissingError
  | typeof TransactionRecorderError.FailedWritingTransactionError
  | typeof TransactionRecorderError.FailedFetchingTransactionError
>;

export type TransactionRecorderRepoAccess = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export interface TransactionRecorderRepo {
  recordTransaction(
    accessPattern: TransactionRecorderRepoAccess,
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>>;

  getTransactionByStripePaymentIntentId(
    accessPattern: TransactionRecorderRepoAccess,
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>>;
}
