import { GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { env } from "@/env";
import { BaseError } from "@/errors";
import { createLogger } from "@/logger";

import { AppConfig } from "../configuration/app-config";
import { DynamoConfigMapper } from "./dynamo-config-mapper";
import {
  SegmentMainTable,
  segmentMainTable,
  SegmentMainTableEntityFactory,
} from "./segment-main-table";
import { ConfigRepository } from "./types";

export class DynamoConfigRepository implements ConfigRepository {
  private logger = createLogger("SegmentConfigRepository");
  private mapper = new DynamoConfigMapper({
    encryptionKey: env.SECRET_KEY,
  });
  private configEntity = SegmentMainTableEntityFactory.createConfigEntity(segmentMainTable);

  static GetEntryError = BaseError.subclass("GetEntryError");
  static SetEntryError = BaseError.subclass("SetEntryError");

  constructor() {}

  async getAppConfigEntry(args: {
    saleorApiUrl: string;
    appId: string;
    configKey: string;
  }): Promise<Result<AppConfig | null, InstanceType<typeof BaseError>>> {
    const getEntryResult = await ResultAsync.fromPromise(
      this.configEntity
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
        new DynamoConfigRepository.GetEntryError("Failed to get config entry", { cause: error }),
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

    return ok(this.mapper.dynamoEntityToAppConfig({ entity: getEntryResult.value.Item }));
  }

  async setAppConfigEntry(args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    config: AppConfig;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    const setEntryResult = await ResultAsync.fromPromise(
      this.configEntity
        .build(PutItemCommand)
        .item(
          this.mapper.appConfigToDynamoPutEntity({
            config: args.config,
            appId: args.appId,
            saleorApiUrl: args.saleorApiUrl,
            configKey: args.configKey,
          }),
        )
        .send(),
      (error) =>
        new DynamoConfigRepository.SetEntryError("Failed to set config entry", { cause: error }),
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
