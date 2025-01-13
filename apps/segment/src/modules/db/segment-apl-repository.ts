import { AuthData } from "@saleor/app-sdk/APL";
import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "dynamodb-toolbox";
import { err, ok, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";
import { createLogger } from "@/logger";
import { SegmentAPLEntityType, SegmentMainTable } from "@/modules/db/segment-main-table";

import { SegmentAPLMapper } from "./segment-apl-mapper";

export class SegmentAPLRepository {
  private logger = createLogger("DynamoDBAPLRepository");

  private segmentAPLMapper = new SegmentAPLMapper();

  static ReadEntityError = BaseError.subclass("ReadEntityError");
  static WriteEntityError = BaseError.subclass("WriteEntityError");
  static DeleteEntityError = BaseError.subclass("DeleteEntityError");
  static ScanEntityError = BaseError.subclass("ScanEntityError");

  constructor(
    private deps: {
      segmentAPLEntity: SegmentAPLEntityType;
    },
  ) {}

  async getEntry(args: { saleorApiUrl: string }) {
    const getEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(GetItemCommand)
        .key({
          PK: SegmentMainTable.getAPLPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
          }),
          SK: SegmentMainTable.getAPLSortKey(),
        })
        .send(),
      (error) =>
        new SegmentAPLRepository.ReadEntityError("Failed to read APL entity", { cause: error }),
    );

    if (getEntryResult.isErr()) {
      this.logger.error("Error while reading APL entity from DynamoDB", {
        error: getEntryResult.error,
      });

      return err(getEntryResult.error);
    }

    if (!getEntryResult.value.Item) {
      this.logger.warn("APL entry not found", { args });

      return err(new SegmentAPLRepository.ReadEntityError("APL entry not found"));
    }

    return ok(this.segmentAPLMapper.dynamoDBEntityToAuthData(getEntryResult.value.Item));
  }

  async setEntry(args: { authData: AuthData }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(PutItemCommand)
        .item(this.segmentAPLMapper.authDataToDynamoPutEntity(args.authData))
        .send(),
      (error) =>
        new SegmentAPLRepository.WriteEntityError("Failed to write APL entity", { cause: error }),
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
      this.deps.segmentAPLEntity
        .build(DeleteItemCommand)
        .key({
          PK: SegmentMainTable.getAPLPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
          }),
          SK: SegmentMainTable.getAPLSortKey(),
        })
        .send(),
      (error) =>
        new SegmentAPLRepository.DeleteEntityError("Failed to delete APL entity", {
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
      this.deps.segmentAPLEntity.table
        .build(ScanCommand)
        .entities(this.deps.segmentAPLEntity)
        .options({
          // keep all the entries in memory - we should introduce pagination in the future
          maxPages: Infinity,
        })
        .send(),
      (error) =>
        new SegmentAPLRepository.ScanEntityError("Failed to scan APL entities", { cause: error }),
    );

    if (scanEntriesResult.isErr()) {
      this.logger.error("Error while scanning APL entities from DynamoDB", {
        error: scanEntriesResult.error,
      });

      return err(scanEntriesResult.error);
    }

    return ok(
      scanEntriesResult.value.Items?.map(this.segmentAPLMapper.dynamoDBEntityToAuthData) ?? [],
    );
  }
}
