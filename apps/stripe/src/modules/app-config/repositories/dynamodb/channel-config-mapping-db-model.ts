import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class DynamoDbChannelConfigMappingAccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  static getSKforSpecificChannel({ channelId }: { channelId: string }) {
    return `CHANNEL_ID#${channelId}` as const;
  }

  static getSKforAllChannels() {
    return `CHANNEL_ID#` as const;
  }
}

export const DynamoDbChannelConfigMappingEntrySchema = schema({
  PK: string().key(),
  SK: string().key(),
  channelId: string(),
  configId: string(),
});

export const createChannelConfigMappingEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "ChannelConfigMapping",
    schema: DynamoDbChannelConfigMappingEntrySchema,
    timestamps: {
      created: {
        name: "createdAt",
        savedAs: "createdAt",
      },
      modified: {
        name: "modifiedAt",
        savedAs: "modifiedAt",
      },
    },
  });
};

export const dynamoDbChannelConfigMappingEntity = createChannelConfigMappingEntity(dynamoMainTable);
export type DynamoDbChannelConfigMappingEntity = typeof dynamoDbChannelConfigMappingEntity;
