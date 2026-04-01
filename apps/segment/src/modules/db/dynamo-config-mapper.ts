import { encrypt } from "@saleor/app-sdk/settings-manager";
import { createRotatingSdkDecrypt } from "@saleor/apps-shared/rotating-sdk-decrypt";
import { type FormattedItem, type PutItemInput } from "dynamodb-toolbox";

import { AppConfig } from "../configuration/app-config";
import { type SegmentConfigEntityType, SegmentMainTable } from "./segment-main-table";

export class DynamoConfigMapper {
  constructor(
    private deps: {
      encryptionKey: string;
      fallbackKeys?: string[];
    },
  ) {}

  private getDecrypt() {
    return createRotatingSdkDecrypt(this.deps.encryptionKey, this.deps.fallbackKeys ?? []);
  }

  dynamoEntityToAppConfig(args: { entity: FormattedItem<SegmentConfigEntityType> }): AppConfig {
    return new AppConfig({
      segmentWriteKey: this.getDecrypt()(
        args.entity.encryptedSegmentWriteKey,
        this.deps.encryptionKey,
      ),
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
