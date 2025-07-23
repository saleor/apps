import { err, ok, Result } from "neverthrow";

import { AppTransaction } from "@/modules/app-transaction/app-transaction";
import {
  AppTransactionError,
  AppTransactionRepoAccess,
  IAppTransactionRepo,
} from "@/modules/app-transaction/types";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";

export class MockedAppTransactionRepo implements IAppTransactionRepo {
  public transactions: Record<string, AppTransaction> = {};

  async createTransaction(
    _accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>> {
    this.transactions[transaction.atobaraiTransactionId] = transaction;

    return ok(null);
  }

  async updateTransaction(
    _accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>> {
    this.transactions[transaction.atobaraiTransactionId] = transaction;

    return ok(null);
  }

  async getTransactionByAtobaraiTransactionId(
    _accessPattern: AppTransactionRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<AppTransaction, AppTransactionError>> {
    const transaction = this.transactions[id];

    if (transaction) {
      return ok(transaction);
    } else {
      return err(new AppTransactionError.TransactionMissingError("Transaction not found"));
    }
  }

  reset() {
    this.transactions = {};
  }
}
