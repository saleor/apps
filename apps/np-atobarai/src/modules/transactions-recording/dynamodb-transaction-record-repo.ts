import { BaseError } from "@saleor/errors";
import { GetItemCommand, PutItemCommand, UpdateItemCommand } from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";

import {
  AtobaraiTransactionId,
  createAtobaraiTransactionId,
} from "../atobarai/atobarai-transaction-id";
import { TransactionRecordConfig, TransactionRecordEntity } from "./dynamodb/entity";
import { TransactionRecord } from "./transaction-record";
import {
  TransactionRecordRepo,
  TransactionRecordRepoAccess,
  TransactionRecordRepoError,
} from "./types";

export class DynamoDBTransactionRecordRepo implements TransactionRecordRepo {
  private entity: TransactionRecordEntity;
  private logger = createLogger("DynamoDBAppTransactionRepo");

  constructor(
    params = {
      entity: TransactionRecordConfig.entity,
    },
  ) {
    this.entity = params.entity;
  }

  async createTransaction(
    accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>> {
    try {
      this.logger.debug("Trying to write Transaction to DynamoDB", { transaction });

      const operation = this.entity
        .build(PutItemCommand)
        .item({
          PK: TransactionRecordConfig.accessPattern.getPK({
            saleorApiUrl: accessPattern.saleorApiUrl,
            appId: accessPattern.appId,
          }),
          SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
            atobaraiTransactionId: transaction.atobaraiTransactionId,
          }),
          atobaraiTransactionId: transaction.atobaraiTransactionId,
          saleorTrackingNumber: transaction.saleorTrackingNumber,
        })
        .options({
          condition: {
            attr: "atobaraiTransactionId",
            exists: false,
          },
        });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode === 200) {
        this.logger.debug("Successfully wrote transaction to DynamoDB", {
          transaction,
        });

        return ok(null);
      }

      throw new BaseError(`Unexpected response from DynamoDB: ${result.$metadata.httpStatusCode}`, {
        cause: result,
      });
    } catch (error) {
      this.logger.debug("Failed to write transaction to DynamoDB", {
        error,
      });

      return err(
        new TransactionRecordRepoError.FailedWritingTransactionError(
          "Failed to write transaction to DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }

  async updateTransaction(
    accessPattern: TransactionRecordRepoAccess,
    transaction: TransactionRecord,
  ): Promise<Result<null, TransactionRecordRepoError>> {
    try {
      this.logger.debug("Trying to update Transaction to DynamoDB", { transaction });

      const operation = this.entity.build(UpdateItemCommand).item({
        PK: TransactionRecordConfig.accessPattern.getPK({
          saleorApiUrl: accessPattern.saleorApiUrl,
          appId: accessPattern.appId,
        }),
        SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
          atobaraiTransactionId: transaction.atobaraiTransactionId,
        }),
        saleorTrackingNumber: transaction.saleorTrackingNumber,
      });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode === 200) {
        this.logger.debug("Successfully updated transaction to DynamoDB", {
          transaction,
        });

        return ok(null);
      }

      throw new BaseError(`Unexpected response from DynamoDB: ${result.$metadata.httpStatusCode}`, {
        cause: result,
      });
    } catch (error) {
      this.logger.debug("Failed to write transaction to DynamoDB", {
        error,
      });

      return err(
        new TransactionRecordRepoError.FailedUpdatingTransactionError(
          "Failed to update transaction to DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }

  async getTransactionByAtobaraiTransactionId(
    accessPattern: TransactionRecordRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<TransactionRecord, TransactionRecordRepoError>> {
    try {
      this.logger.debug("Trying to get Transaction from DynamoDB", { id });

      const operation = this.entity.build(GetItemCommand).key({
        PK: TransactionRecordConfig.accessPattern.getPK({
          saleorApiUrl: accessPattern.saleorApiUrl,
          appId: accessPattern.appId,
        }),
        SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
          atobaraiTransactionId: id,
        }),
      });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new TransactionRecordRepoError.FailedFetchingTransactionError(
            `Failed to read data from DynamoDB. HTTP status code: ${result.$metadata.httpStatusCode}`,
            {
              cause: result,
            },
          ),
        );
      }

      if (result.Item) {
        const { atobaraiTransactionId, saleorTrackingNumber } = result.Item;

        return ok(
          new TransactionRecord({
            atobaraiTransactionId: createAtobaraiTransactionId(atobaraiTransactionId),
            saleorTrackingNumber: saleorTrackingNumber,
          }),
        );
      } else {
        return err(
          new TransactionRecordRepoError.TransactionMissingError(
            "Transaction not found in Database",
            {
              props: {
                paymentIntentId: id,
              },
            },
          ),
        );
      }
    } catch (error) {
      return err(
        new TransactionRecordRepoError.FailedFetchingTransactionError(
          "Failed to fetch transaction from DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }
}
