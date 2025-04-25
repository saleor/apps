import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class ChannelConfigMappingAccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }
  static getSK({ channelId }: { channelId: string }) {
    return `CHANNEL_ID#${channelId}` as const;
  }
}

const EntrySchema = schema({
  PK: string().key(),
  SK: string().key(),
  channelId: string(),
  configId: string(),
});

export const createChannelConfigMappingEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "ChannelConfigMapping",
    schema: EntrySchema,
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

export const channelConfigMappingEntity = createChannelConfigMappingEntity(dynamoMainTable);
export type ChannelConfigMappingEntity = typeof channelConfigMappingEntity;
