import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiTransactionId } from "../atobarai/atobarai-transaction-id";
import { AppTransaction } from "./app-transaction";

export type AppTransactionRepoAccess = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export const AppTransactionError = {
  /**
   * Current assumption is that transaction MUST exist before reading it.
   * If not, it's something wrong with the business logic - that's why it's not null, but error
   */
  TransactionMissingError: BaseError.subclass("AppTransactionError.TransactionMissingError", {
    props: {
      _brand: "AppTransactionError.TransactionMissingError" as const,
    },
  }),
  FailedWritingTransactionError: BaseError.subclass(
    "AppTransactionError.FailedWritingTransactionError",
    {
      props: {
        _brand: "AppTransactionError.FailedWritingTransactionError" as const,
      },
    },
  ),
  FailedUpdatingTransactionError: BaseError.subclass(
    "AppTransactionError.FailedUpdatingTransactionError",
    {
      props: {
        _brand: "AppTransactionError.FailedUpdatingTransactionError" as const,
      },
    },
  ),
  FailedFetchingTransactionError: BaseError.subclass(
    "AppTransactionError.FailedFetchingTransactionError",
    {
      props: {
        _brand: "AppTransactionError.FailedFetchingTransactionError" as const,
      },
    },
  ),
};

export type AppTransactionError = InstanceType<
  | typeof AppTransactionError.TransactionMissingError
  | typeof AppTransactionError.FailedWritingTransactionError
  | typeof AppTransactionError.FailedFetchingTransactionError
  | typeof AppTransactionError.FailedUpdatingTransactionError
>;

export interface IAppTransactionRepo {
  createTransaction(
    accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>>;
  updateTransaction(
    accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>>;
  getTransactionByAtobaraiTransactionId(
    accessPattern: AppTransactionRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<AppTransaction, AppTransactionError>>;
}
