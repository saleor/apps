import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Entity, item, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

class DynamoDbChannelConfigMappingAccessPattern {
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

const DynamoDbChannelConfigMappingEntrySchema = item({
  PK: string().key(),
  SK: string().key(),
  channelId: string(),
  configId: string().optional(),
});

const createChannelConfigMappingEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "ChannelConfigMapping",
    schema: DynamoDbChannelConfigMappingEntrySchema,
    entityAttribute: { name: "aaa" },
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

const dynamoDbChannelConfigMappingEntity = createChannelConfigMappingEntity(dynamoMainTable);

export type DynamoDbChannelConfigMappingEntity = typeof dynamoDbChannelConfigMappingEntity;

export const DynamoDbChannelConfigMapping = {
  accessPattern: {
    getPK: DynamoDbChannelConfigMappingAccessPattern.getPK,
    getSKforSpecificChannel: DynamoDbChannelConfigMappingAccessPattern.getSKforSpecificChannel,
    getSKforAllChannels: DynamoDbChannelConfigMappingAccessPattern.getSKforAllChannels,
  },
  entitySchema: DynamoDbChannelConfigMappingEntrySchema,
  createEntity: createChannelConfigMappingEntity,
  entity: dynamoDbChannelConfigMappingEntity,
};
