import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiTransactionId } from "../atobarai/atobarai-transaction-id";
import { TransactionRecord } from "./transaction-record";

export type TransactionRecordRepoAccess = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export const TransactionRecordRepoError = {
  /**
   * Current assumption is that transaction MUST exist before reading it.
   * If not, it's something wrong with the business logic - that's why it's not null, but error
   */
  TransactionMissingError: BaseError.subclass(
    "TransactionRecordRepoError.TransactionMissingError",
    {
      props: {
        _brand: "TransactionRecordRepoError.TransactionMissingError" as const,
      },
    },
  ),
  FailedWritingTransactionError: BaseError.subclass(
    "TransactionRecordRepoError.FailedWritingTransactionError",
    {
      props: {
        _brand: "TransactionRecordRepoError.FailedWritingTransactionError" as const,
      },
    },
  ),
  FailedUpdatingTransactionError: BaseError.subclass(
    "TransactionRecordRepoError.FailedUpdatingTransactionError",
    {
      props: {
        _brand: "TransactionRecordRepoError.FailedUpdatingTransactionError" as const,
      },
    },
  ),
  FailedFetchingTransactionError: BaseError.subclass(
    "TransactionRecordRepoError.FailedFetchingTransactionError",
    {
      props: {
        _brand: "TransactionRecordRepoError.FailedFetchingTransactionError" as const,
      },
    },
  ),
};

export type TransactionRecordRepoError = InstanceType<
  | typeof TransactionRecordRepoError.TransactionMissingError
  | typeof TransactionRecordRepoError.FailedWritingTransactionError
  | typeof TransactionRecordRepoError.FailedFetchingTransactionError
  | typeof TransactionRecordRepoError.FailedUpdatingTransactionError
>;

export interface TransactionRecordRepo {
  createTransaction(
    accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>>;
  updateTransaction(
    accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>>;
  getTransactionByAtobaraiTransactionId(
    accessPattern: TransactionRecordRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<TransactionRecord, TransactionRecordRepoError>>;
}
