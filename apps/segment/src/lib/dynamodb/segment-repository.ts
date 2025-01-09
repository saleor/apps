import { AuthData } from "@saleor/app-sdk/APL";
import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand } from "dynamodb-toolbox";
import { err, ok, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";
import { createLogger } from "@/logger";

import { SegmentAPLEntity, SegmentConfigTable } from "./segment-config-table";

export class SegmentAPLRepository {
  private logger = createLogger("SegmentAPLRepository");

  static ReadEntityError = BaseError.subclass("ReadEntityError");
  static WriteEntityError = BaseError.subclass("WriteEntityError");
  static DeleteEntityError = BaseError.subclass("DeleteEntityError");
  static ScanEntityError = BaseError.subclass("ScanEntityError");

  constructor(
    private deps: {
      segmentAPLEntity: SegmentAPLEntity;
    },
  ) {}

  async getEntry(args: { saleorApiUrl: string; appManifestId: string }) {
    const getEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(GetItemCommand)
        .key({
          PK: SegmentConfigTable.getPrimaryKey({
            appManifestId: args.appManifestId,
          }),
          SK: SegmentConfigTable.getAPLSortKey({
            saleorApiUrl: args.saleorApiUrl,
          }),
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

      return err(new SegmentAPLRepository.ReadEntityError("TAPL entry not found"));
    }

    return ok(getEntryResult.value.Item);
  }

  async setEntry(args: { saleorApiUrl: string; authData: AuthData; appManifestId: string }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(PutItemCommand)
        .item({
          PK: SegmentConfigTable.getPrimaryKey({
            appManifestId: args.appManifestId,
          }),
          SK: SegmentConfigTable.getAPLSortKey({
            saleorApiUrl: args.saleorApiUrl,
          }),
          domain: args.authData.domain,
          token: args.authData.token,
          saleorApiUrl: args.authData.saleorApiUrl,
          appId: args.authData.appId,
          jwks: args.authData.jwks,
        })
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

  async deleteEntry(args: { saleorApiUrl: string; appManifestId: string }) {
    const deleteEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity
        .build(DeleteItemCommand)
        .key({
          PK: SegmentConfigTable.getPrimaryKey({
            appManifestId: args.appManifestId,
          }),
          SK: SegmentConfigTable.getAPLSortKey({
            saleorApiUrl: args.saleorApiUrl,
          }),
        })
        .send(),
      (error) =>
        new SegmentAPLRepository.DeleteEntityError("Failed to delete APL entity", { cause: error }),
    );

    if (deleteEntryResult.isErr()) {
      this.logger.error("Error while deleting entry APL from DynamoDB", {
        error: deleteEntryResult.error,
      });

      return err(deleteEntryResult.error);
    }

    return ok(undefined);
  }

  async getAllEntries(args: { appManifestId: string }) {
    const scanEntriesResult = await ResultAsync.fromPromise(
      this.deps.segmentAPLEntity.table
        .build(QueryCommand)
        .query({
          partition: SegmentConfigTable.getPrimaryKey({ appManifestId: args.appManifestId }),
        })
        .entities(this.deps.segmentAPLEntity)
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

    return ok(scanEntriesResult.value.Items ?? []);
  }
}
