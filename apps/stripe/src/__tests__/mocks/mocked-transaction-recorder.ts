import { err, ok, Result } from "neverthrow";

import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  RecordedTransaction,
  TransactionRecorder,
  TransactionRecorderError,
} from "@/modules/transactions-recording/transaction-recorder";

export class MockedTransactionRecorder implements TransactionRecorder {
  public transactions: Record<string, RecordedTransaction> = {};

  async recordTransaction(
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>> {
    this.transactions[transaction.stripePaymentIntentId] = transaction;

    return ok(null);
  }

  async getTransactionByStripePaymentIntentId(
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>> {
    const transaction = this.transactions[id];

    if (transaction) {
      return ok(transaction);
    } else {
      return err(new TransactionRecorderError.TransactionMissingError("Transaction not found"));
    }
  }
}
