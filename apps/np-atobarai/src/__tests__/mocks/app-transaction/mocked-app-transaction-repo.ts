import { err, ok, Result } from "neverthrow";

import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";
import {
  TransactionRecordRepo,
  TransactionRecordRepoAccess,
  TransactionRecordRepoError,
} from "@/modules/transactions-recording/types";

export class MockedAppTransactionRepo implements TransactionRecordRepo {
  public transactions: Record<string, TransactionRecord> = {};

  async createTransaction(
    _accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>> {
    this.transactions[transaction.atobaraiTransactionId] = transaction;

    return ok(null);
  }

  async updateTransaction(
    _accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>> {
    this.transactions[transaction.atobaraiTransactionId] = transaction;

    return ok(null);
  }

  async getTransactionByAtobaraiTransactionId(
    _accessPattern: TransactionRecordRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<TransactionRecord, TransactionRecordRepoError>> {
    const transaction = this.transactions[id];

    if (transaction) {
      return ok(transaction);
    } else {
      return err(new TransactionRecordRepoError.TransactionMissingError("Transaction not found"));
    }
  }

  reset() {
    this.transactions = {};
  }
}
