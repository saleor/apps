import { GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { BaseError } from "@/errors";
import { createLogger } from "@/logger";

import { SegmentConfigEntityType, SegmentMainTable } from "./segment-main-table";

export interface ConfigRepository {
  getEntry: (args: {
    saleorApiUrl: string;
    appId: string;
    configKey: string;
  }) => Promise<Result<string | null, InstanceType<typeof BaseError>>>;
  setEntry: (args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    configValue: string;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
}

export class SegmentConfigRepository implements ConfigRepository {
  private logger = createLogger("SegmentConfigRepository");

  static GetEntryError = BaseError.subclass("GetEntryError");
  static SetEntryError = BaseError.subclass("SetEntryError");

  constructor(
    private deps: {
      segmentConfigEntity: SegmentConfigEntityType;
    },
  ) {}

  async getEntry(args: { saleorApiUrl: string; appId: string; configKey: string }) {
    const getEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentConfigEntity
        .build(GetItemCommand)
        .key({
          PK: SegmentMainTable.getConfigPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
            appId: args.appId,
          }),
          SK: SegmentMainTable.getConfigSortKey({
            configKey: args.configKey,
          }),
        })
        .send(),
      (error) =>
        new SegmentConfigRepository.GetEntryError("Failed to get config entry", { cause: error }),
    );

    if (getEntryResult.isErr()) {
      this.logger.error("Error while reading config entry from DynamoDB", {
        error: getEntryResult.error,
      });

      return err(getEntryResult.error);
    }

    if (!getEntryResult.value.Item) {
      this.logger.warn("Config entry not found", { args });

      return ok(null);
    }

    return ok(getEntryResult.value.Item.value);
  }

  async setEntry(args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    configValue: string;
  }) {
    const setEntryResult = await ResultAsync.fromPromise(
      this.deps.segmentConfigEntity
        .build(PutItemCommand)
        .item({
          PK: SegmentMainTable.getConfigPrimaryKey({
            saleorApiUrl: args.saleorApiUrl,
            appId: args.appId,
          }),
          SK: SegmentMainTable.getConfigSortKey({
            configKey: args.configKey,
          }),
          value: args.configValue,
        })
        .send(),
      (error) =>
        new SegmentConfigRepository.SetEntryError("Failed to set config entry", { cause: error }),
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
