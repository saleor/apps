import { AuthData } from "@saleor/app-sdk/APL";
import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "dynamodb-toolbox";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AplAccessPattern, DynamoDbAplEntity } from "@/modules/apl/apl-db-model";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { APLRepository } from "./apl-repository";

export class DynamoAPLRepository implements APLRepository {
  private logger = createLogger("DynamoAPLRepository");

  private aplEntity: DynamoDbAplEntity;

  static ReadEntityError = BaseError.subclass("ReadEntityError");
  static WriteEntityError = BaseError.subclass("WriteEntityError");
  static DeleteEntityError = BaseError.subclass("DeleteEntityError");
  static ScanEntityError = BaseError.subclass("ScanEntityError");

  constructor(deps: { entity: DynamoDbAplEntity }) {
    this.aplEntity = deps.entity;
  }

  async getEntry(args: {
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<AuthData | null, InstanceType<typeof BaseError>>> {
    const getEntryResult = await ResultAsync.fromPromise(
      this.aplEntity
        .build(GetItemCommand)
        .key({
          PK: AplAccessPattern.getPK({
            saleorApiUrl: args.saleorApiUrl,
          }),
          SK: AplAccessPattern.getSK(),
        })
        .send(),
      (error) =>
        new DynamoAPLRepository.ReadEntityError("Failed to read APL entity", { cause: error }),
    );

    if (getEntryResult.isErr()) {
      this.logger.error("Error while reading APL entity from DynamoDB", {
        error: getEntryResult.error,
      });

      return err(getEntryResult.error);
    }

    if (!getEntryResult.value.Item) {
      this.logger.warn("APL entry not found", { args });

      return ok(null);
    }

    const { appId, jwks, token, saleorApiUrl } = getEntryResult.value.Item;

    return ok({
      saleorApiUrl,
      appId,
      jwks,
      token,
    });
  }

  async setEntry({ authData }: { authData: AuthData }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.aplEntity
        .build(PutItemCommand)
        .item({
          PK: AplAccessPattern.getPK({ saleorApiUrl: authData.saleorApiUrl }),
          SK: AplAccessPattern.getSK(),
          token: authData.token,
          saleorApiUrl: authData.saleorApiUrl,
          appId: authData.appId,
          jwks: authData.jwks,
        })
        .send(),
      (error) =>
        new DynamoAPLRepository.WriteEntityError("Failed to write APL entity", {
          cause: error,
        }),
    );

    if (setEntryResult.isErr()) {
      this.logger.error("Error while putting APL into DynamoDB", {
        error: setEntryResult.error,
      });

      return err(setEntryResult.error);
    }

    return ok(undefined);
  }

  async deleteEntry(args: { saleorApiUrl: string }) {
    const deleteEntryResult = await ResultAsync.fromPromise(
      this.aplEntity
        .build(DeleteItemCommand)
        .key({
          PK: AplAccessPattern.getPK({
            saleorApiUrl: args.saleorApiUrl,
          }),
          SK: AplAccessPattern.getSK(),
        })
        .send(),
      (error) =>
        new DynamoAPLRepository.DeleteEntityError("Failed to delete APL entity", {
          cause: error,
        }),
    );

    if (deleteEntryResult.isErr()) {
      this.logger.error("Error while deleting entry APL from DynamoDB", {
        error: deleteEntryResult.error,
      });

      return err(deleteEntryResult.error);
    }

    return ok(undefined);
  }

  async getAllEntries() {
    const scanEntriesResult = await ResultAsync.fromPromise(
      this.aplEntity.table
        .build(ScanCommand)
        .entities(this.aplEntity)
        .options({
          // keep all the entries in memory - we should introduce pagination in the future
          maxPages: Infinity,
        })
        .send(),
      (error) =>
        new DynamoAPLRepository.ScanEntityError("Failed to scan APL entities", {
          cause: error,
        }),
    );

    if (scanEntriesResult.isErr()) {
      this.logger.error("Error while scanning APL entities from DynamoDB", {
        error: scanEntriesResult.error,
      });

      return err(scanEntriesResult.error);
    }

    const possibleItems = scanEntriesResult.value.Items ?? [];

    if (possibleItems.length > 0) {
      return ok(
        possibleItems.map((item) => {
          const { appId, jwks, token, saleorApiUrl } = item;

          return {
            saleorApiUrl,
            appId,
            jwks,
            token,
          };
        }),
      );
    }

    return ok(null);
  }
}
