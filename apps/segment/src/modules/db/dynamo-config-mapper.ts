import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { FormattedItem, PutItemInput } from "dynamodb-toolbox";

import { AppConfig } from "../configuration/app-config";
import { SegmentConfigEntityType, SegmentMainTable } from "./segment-main-table";

export class DynamoConfigMapper {
  constructor(
    private deps: {
      encryptionKey: string;
    },
  ) {}

  dynamoEntityToAppConfig(args: { entity: FormattedItem<SegmentConfigEntityType> }): AppConfig {
    return new AppConfig({
      segmentWriteKey: decrypt(args.entity.encryptedSegmentWriteKey, this.deps.encryptionKey),
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
      encryptedSegmentWriteKey: encrypt(
        /*
         * TODO: maybe we should handle this in neverthrow and don't allow empty string in DynamoDB
         *
         * save empty string if config is just created and it doesn't have segmentWriteKey set yet
         */
        args.config.getConfig()?.segmentWriteKey ?? "",
        this.deps.encryptionKey,
      ),
    };
  }
}
