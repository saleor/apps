import { GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
import { err, ok, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";
import { createLogger } from "@/logger";

import { SegmentConfigEntity, SegmentConfigTable } from "./segment-config-table";

export class SegmentConfigRepository {
  private logger = createLogger("SegmentConfigRepository");

  static ReadEntityError = BaseError.subclass("ReadEntityError");
  static WriteEntityError = BaseError.subclass("WriteEntityError");

  constructor(
    private deps: {
      segmentConfigEntity: SegmentConfigEntity;
    },
  ) {}

  async getConfig(args: { appId: string; saleorApiUrl: string; configKey: string }) {
    const getEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentConfigEntity
        .build(GetItemCommand)
        .key({
          PK: SegmentConfigTable.getConfigPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
            appId: args.appId,
          }),
          SK: SegmentConfigTable.getConfigSortKey({
            configKey: args.configKey,
          }),
        })
        .send(),
      (error) =>
        new SegmentConfigRepository.ReadEntityError("Failed to read APL entity", { cause: error }),
    );

    if (getEntryResult.isErr()) {
      this.logger.error("Error while reading config entity from DynamoDB", {
        error: getEntryResult.error,
      });

      return err(getEntryResult.error);
    }

    if (!getEntryResult.value.Item) {
      this.logger.warn("Config entry not found", { args });

      return err(new SegmentConfigRepository.ReadEntityError("Config entry not found"));
    }

    return ok(getEntryResult.value.Item);
  }

  async setConfig(args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    configValue: string;
  }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentConfigEntity
        .build(PutItemCommand)
        .item({
          PK: SegmentConfigTable.getConfigPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
            appId: args.appId,
          }),
          SK: SegmentConfigTable.getConfigSortKey({
            configKey: args.configKey,
          }),
          //   TODO: encrypt this value
          value: args.configValue,
        })
        .send(),
      (error) =>
        new SegmentConfigRepository.WriteEntityError("Failed to write config entity", {
          cause: error,
        }),
    );

    if (setEntryResult.isErr()) {
      this.logger.error("Error while putting config into DynamoDB", {
        error: setEntryResult.error,
      });

      return err(setEntryResult.error);
    }

    return ok(undefined);
  }
}
