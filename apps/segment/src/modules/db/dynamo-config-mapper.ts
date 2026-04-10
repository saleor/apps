import { encrypt } from "@saleor/app-sdk/settings-manager";
import { type Logger } from "@saleor/apps-logger";
import { createRotatingDecryptCallback } from "@saleor/apps-shared/key-rotation/rotating-decrypt-callback";
import { type FormattedItem, type PutItemInput } from "dynamodb-toolbox";

import { AppConfig } from "../configuration/app-config";
import { type SegmentConfigEntityType, SegmentMainTable } from "./segment-main-table";

export class DynamoConfigMapper {
  private readonly decrypt: (value: string, secret: string) => string;

  constructor(
    private deps: {
      encryptionKey: string;
      fallbackKeys?: string[];
      logger: Logger;
    },
  ) {
    this.decrypt = createRotatingDecryptCallback(
      deps.encryptionKey,
      deps.fallbackKeys ?? [],
      deps.logger,
    );
  }

  dynamoEntityToAppConfig(args: { entity: FormattedItem<SegmentConfigEntityType> }): AppConfig {
    return new AppConfig({
      segmentWriteKey: this.decrypt(args.entity.encryptedSegmentWriteKey, this.deps.encryptionKey),
    });
  }

  appConfigToDynamoPutEntity(args: {
    config: AppConfig;
    appId: string;
    saleorApiUrl: string;
    configKey: string;
  }): PutItemInput<SegmentConfigEntityType> {
    return {
      PK: SegmentMainTable.getConfigPrimaryKey({
        saleorApiUrl: args.saleorApiUrl,
        appId: args.appId,
      }),
      SK: SegmentMainTable.getConfigSortKey({
        configKey: args.configKey,
      }),
      encryptedSegmentWriteKey: encrypt(args.config.getSegmentWriteKey(), this.deps.encryptionKey),
    };
  }
}
