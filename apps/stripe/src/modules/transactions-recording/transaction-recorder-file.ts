import fs from "node:fs";

import { err, ok, Result } from "neverthrow";

import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import {
  RecordedTransaction,
  TransactionRecorder,
  TransactionRecorderError,
} from "@/modules/transactions-recording/transaction-recorder";

type InnerStructure = Record<string, RecordedTransaction>;

/**
 * Local file-based transaction recorder.
 * It's temporary
 *
 * TODO: Set up DynamoDB instead
 */
export class TransactionRecorderFile implements TransactionRecorder {
  private filePath = ".transactions-record.json";

  private readAndParseFile(): InnerStructure {
    try {
      const file = fs.readFileSync(this.filePath, "utf-8");

      return JSON.parse(file) as InnerStructure;
    } catch {
      this.writeFile({});

      return {};
    }
  }

  private writeFile(transactions: InnerStructure) {
    return fs.writeFileSync(JSON.stringify(transactions), "utf-8");
  }

  async recordTransaction(
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>> {
    const currentFile = this.readAndParseFile();

    currentFile[transaction.stripePaymentIntentId] = transaction;

    this.writeFile(currentFile);

    return ok(null);
  }

  async getTransactionByStripePaymentIntentId(
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>> {
    try {
      const currentFile = this.readAndParseFile();

      const transaction = currentFile[id];

      return ok(
        new RecordedTransaction(
          transaction.saleorTransactionId,
          createStripePaymentIntentId(transaction.stripePaymentIntentId)._unsafeUnwrap(),
          transaction.transactionFlow,
        ),
      );
    } catch (e) {
      return err(
        new TransactionRecorderError.PersistenceNotAvailable(
          "Error with File Transaction Recorded",
          {
            cause: e,
          },
        ),
      );
    }
  }
}
