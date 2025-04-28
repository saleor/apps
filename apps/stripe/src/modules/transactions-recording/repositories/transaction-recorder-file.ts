import fs from "node:fs";

import { err, ok, Result } from "neverthrow";

import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

type InnerStructure = Record<string, RecordedTransaction>;

/**
 * Local file-based transaction recorder.
 * It's temporary
 *
 * TODO: Set up DynamoDB instead
 */
export class TransactionRecorderFile implements TransactionRecorderRepo {
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
    return fs.writeFileSync(this.filePath, JSON.stringify(transactions), "utf-8");
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

      if (!transaction) {
        return err(
          new TransactionRecorderError.TransactionMissingError("Transaction not found in Database"),
        );
      }

      return ok(
        new RecordedTransaction({
          saleorTransactionFlow: transaction.saleorTransactionFlow,
          resolvedTransactionFlow: transaction.resolvedTransactionFlow,
          selectedPaymentMethod: transaction.selectedPaymentMethod,
          saleorTransactionId: transaction.saleorTransactionId,
          stripePaymentIntentId: createStripePaymentIntentId(
            transaction.stripePaymentIntentId,
          )._unsafeUnwrap(),
        }),
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
