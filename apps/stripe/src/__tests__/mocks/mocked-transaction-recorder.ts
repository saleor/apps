import { err, ok, Result } from "neverthrow";

import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
  TransactionRecorderRepoAccess,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

export class MockedTransactionRecorder implements TransactionRecorderRepo {
  public transactions: Record<string, RecordedTransaction> = {};

  async recordTransaction(
    _accessPattern: TransactionRecorderRepoAccess,
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>> {
    this.transactions[transaction.stripePaymentIntentId] = transaction;

    return ok(null);
  }

  async getTransactionByStripePaymentIntentId(
    _accessPattern: TransactionRecorderRepoAccess,
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>> {
    const transaction = this.transactions[id];

    if (transaction) {
      return ok(transaction);
    } else {
      return err(new TransactionRecorderError.TransactionMissingError("Transaction not found"));
    }
  }

  reset() {
    this.transactions = {};
  }
}
