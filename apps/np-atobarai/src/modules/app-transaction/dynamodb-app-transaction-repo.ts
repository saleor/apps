import { BaseError } from "@saleor/errors";
import { GetItemCommand, PutItemCommand, UpdateItemCommand } from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";

import {
  AtobaraiTransactionId,
  createAtobaraiTransactionId,
} from "../atobarai/atobarai-transaction-id";
import { AppTransaction } from "./app-transaction";
import {
  appTransactionEntity,
  DynamoDbAppTransactionEntity,
  getPK,
  getSKForSpecificItem,
} from "./dynamodb/entity";
import { AppTransactionError, AppTransactionRepoAccess, IAppTransactionRepo } from "./types";

export class DynamoDBAppTransactionRepo implements IAppTransactionRepo {
  private entity: DynamoDbAppTransactionEntity;
  private logger = createLogger("DynamoDBAppTransactionRepo");

  constructor(
    params = {
      entity: appTransactionEntity,
    },
  ) {
    this.entity = params.entity;
  }

  async createTransaction(
    accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>> {
    try {
      this.logger.debug("Trying to write Transaction to DynamoDB", { transaction });

      const operation = this.entity
        .build(PutItemCommand)
        .item({
          PK: getPK({
            saleorApiUrl: accessPattern.saleorApiUrl,
            appId: accessPattern.appId,
          }),
          SK: getSKForSpecificItem({
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
        new AppTransactionError.FailedWritingTransactionError(
          "Failed to write transaction to DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }

  async updateTransaction(
    accessPattern: AppTransactionRepoAccess,
    transaction: AppTransaction,
  ): Promise<Result<null, AppTransactionError>> {
    try {
      this.logger.debug("Trying to update Transaction to DynamoDB", { transaction });

      const operation = this.entity.build(UpdateItemCommand).item({
        PK: getPK({
          saleorApiUrl: accessPattern.saleorApiUrl,
          appId: accessPattern.appId,
        }),
        SK: getSKForSpecificItem({
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
        new AppTransactionError.FailedUpdatingTransactionError(
          "Failed to update transaction to DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }

  async getTransactionByAtobaraiTransactionId(
    accessPattern: AppTransactionRepoAccess,
    id: AtobaraiTransactionId,
  ): Promise<Result<AppTransaction, AppTransactionError>> {
    try {
      this.logger.debug("Trying to get Transaction from DynamoDB", { id });

      const operation = this.entity.build(GetItemCommand).key({
        PK: getPK({
          saleorApiUrl: accessPattern.saleorApiUrl,
          appId: accessPattern.appId,
        }),
        SK: getSKForSpecificItem({
          atobaraiTransactionId: id,
        }),
      });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new AppTransactionError.FailedFetchingTransactionError(
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
          new AppTransaction({
            atobaraiTransactionId: createAtobaraiTransactionId(atobaraiTransactionId),
            saleorTrackingNumber: saleorTrackingNumber,
          }),
        );
      } else {
        return err(
          new AppTransactionError.TransactionMissingError("Transaction not found in Database", {
            props: {
              paymentIntentId: id,
            },
          }),
        );
      }
    } catch (error) {
      return err(
        new AppTransactionError.FailedFetchingTransactionError(
          "Failed to fetch transaction from DynamoDB",
          {
            cause: error,
          },
        ),
      );
    }
  }
}
