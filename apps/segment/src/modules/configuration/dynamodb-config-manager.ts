import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { BaseError } from "@/errors";
import { SegmentConfigRepository } from "@/lib/dynamodb/segment-config-repository";
import {
  SegmentConfigTable,
  SegmentConfigTableEntityFactory,
} from "@/lib/dynamodb/segment-config-table";

import { AppConfig } from "./app-config";

export interface UpdatedAppConfigMetadataManager {
  // TODO: add get and create or get - to be discussed
  get(args: { saleorApiUrl: string; appId: string }): Promise<AppConfig>;
  set(args: { config: AppConfig; saleorApiUrl: string; appId: string }): Promise<void>;
}

export class DynamoDBConfigManager implements UpdatedAppConfigMetadataManager {
  private segmentConfigRepository: SegmentConfigRepository;

  public readonly configKey = "app-config-v1";

  constructor({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }) {
    const table = SegmentConfigTable.create({
      tableName,
      documentClient,
    });

    const segmentConfigEntity = SegmentConfigTableEntityFactory.createConfigEntity(table);

    this.segmentConfigRepository = new SegmentConfigRepository({ segmentConfigEntity });
  }

  async get(args: { saleorApiUrl: string; appId: string }): Promise<AppConfig> {
    const possibleResult = await this.segmentConfigRepository.getConfig({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configKey: this.configKey,
    });

    if (possibleResult.isErr()) {
      // TODO: what do there?
      return new AppConfig();
    }

    return AppConfig.parse(possibleResult.value.value);
  }
  async set(args: { config: AppConfig; saleorApiUrl: string; appId: string }): Promise<void> {
    const possibleResult = await this.segmentConfigRepository.setConfig({
      appId: args.appId,
      saleorApiUrl: args.saleorApiUrl,
      configKey: this.configKey,
      configValue: args.config.serialize(),
    });

    if (possibleResult.isErr()) {
      throw new BaseError("Failed to set config entry");
    }

    return undefined;
  }
}
