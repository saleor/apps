import { GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import {
  DynamoDbRecordedTransaction,
  DynamoDbRecordedTransactionEntity,
} from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
  TransactionRecorderRepoAccess,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

export class DynamoDBTransactionRecorderRepo implements TransactionRecorderRepo {
  private entity: DynamoDbRecordedTransactionEntity;

  private logger = createLogger("DynamoDBTransactionRecorderRepo");

  constructor(
    params = {
      entity: DynamoDbRecordedTransaction.entity,
    },
  ) {
    this.entity = params.entity;
  }

  // TODO: Check against duplicate, do not allow to write it
  async recordTransaction(
    accessPattern: TransactionRecorderRepoAccess,
    transaction: RecordedTransaction,
  ): Promise<Result<null, TransactionRecorderError>> {
    try {
      this.logger.debug("Trying to write Transaction to DynamoDB", { transaction });

      const result = await this.entity
        .build(PutItemCommand)
        .item({
          PK: DynamoDbRecordedTransaction.accessPattern.getPK({
            appId: accessPattern.appId,
            saleorApiUrl: accessPattern.saleorApiUrl,
          }),
          SK: DynamoDbRecordedTransaction.accessPattern.getSKforSpecificItem({
            paymentIntentId: transaction.stripePaymentIntentId,
          }),
          paymentIntentId: transaction.stripePaymentIntentId,
          selectedPaymentMethod: transaction.selectedPaymentMethod,
          saleorTransactionId: transaction.saleorTransactionId,
          saleorTransactionFlow: transaction.saleorTransactionFlow,
          resolvedTransactionFlow: transaction.resolvedTransactionFlow,
        })
        .send();

      if (result.$metadata.httpStatusCode === 200) {
        this.logger.info("Successfully wrote transaction to DynamoDB", {
          transaction,
        });

        return ok(null);
      }

      throw new BaseError("Unexpected response from DynamoDB: " + result.$metadata.httpStatusCode, {
        cause: result,
      });
    } catch (e) {
      this.logger.error("Failed to write transaction to DynamoDB", {
        error: e,
      });

      return err(
        new TransactionRecorderError.FailedWritingTransactionError(
          "Failed to write transaction to DynamoDB",
          {
            cause: e,
          },
        ),
      );
    }
  }

  async getTransactionByStripePaymentIntentId(
    accessPattern: TransactionRecorderRepoAccess,
    id: StripePaymentIntentId,
  ): Promise<Result<RecordedTransaction, TransactionRecorderError>> {
    try {
      const result = await this.entity
        .build(GetItemCommand)
        .key({
          PK: DynamoDbRecordedTransaction.accessPattern.getPK(accessPattern),
          SK: DynamoDbRecordedTransaction.accessPattern.getSKforSpecificItem({
            paymentIntentId: id,
          }),
        })
        .send();

      if (result.Item) {
        const {
          selectedPaymentMethod,
          saleorTransactionId,
          saleorTransactionFlow,
          paymentIntentId,
          resolvedTransactionFlow,
        } = result.Item;

        return ok(
          new RecordedTransaction({
            resolvedTransactionFlow: createResolvedTransactionFlow(resolvedTransactionFlow),
            saleorTransactionFlow: createSaleorTransactionFlow(saleorTransactionFlow),
            saleorTransactionId: createSaleorTransactionId(saleorTransactionId),
            stripePaymentIntentId: createStripePaymentIntentId(paymentIntentId)._unsafeUnwrap(), // todo unwrap this from neverthrow
            selectedPaymentMethod: selectedPaymentMethod as PaymentMethod["type"],
          }),
        );
      } else {
        return err(
          new TransactionRecorderError.TransactionMissingError("Transaction not found in Database"),
        );
      }
    } catch (e) {
      return err(
        new TransactionRecorderError.FailedFetchingTransactionError(
          "Failed to fetch transaction from DynamoDB",
          {
            cause: e,
          },
        ),
      );
    }
  }
}
