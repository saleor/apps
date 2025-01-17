import { AuthData } from "@saleor/app-sdk/APL";
import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "dynamodb-toolbox";
import { err, ok, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";
import { createLogger } from "@/logger";
import { SegmentAPLEntityType, SegmentMainTable } from "@/modules/db/segment-main-table";

import { SegmentAPLMapper } from "./segment-apl-mapper";
import { APLRepository } from "./types";

export class SegmentConfigRepository implements APLRepository {
  private logger = createLogger("SegmentAPLRepository");

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
        new SegmentConfigRepository.ReadEntityError("Failed to read APL entity", { cause: error }),
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

    return ok(this.segmentAPLMapper.dynamoDBEntityToAuthData(getEntryResult.value.Item));
  }

  async setEntry(args: { authData: AuthData }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(PutItemCommand)
        .item(this.segmentAPLMapper.authDataToDynamoPutEntity(args.authData))
        .send(),
      (error) =>
        new SegmentConfigRepository.WriteEntityError("Failed to write APL entity", {
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
        new SegmentConfigRepository.DeleteEntityError("Failed to delete APL entity", {
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
        new SegmentConfigRepository.ScanEntityError("Failed to scan APL entities", {
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
      return ok(possibleItems.map(this.segmentAPLMapper.dynamoDBEntityToAuthData));
    }

    return ok(null);
  }
}
