import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

class AccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  static getSKforSpecificItem({ configId }: { configId: string }) {
    return `CONFIG_ID#${configId}` as const;
  }

  static getSKforAllItems() {
    return `CONFIG_ID#` as const;
  }
}

const ChannelConfigSchema = schema({
  PK: string().key(),
  SK: string().key(),
  configName: string(),
  configId: string(),
  //todo
});

const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "AppChannelConfig",
    schema: ChannelConfigSchema,
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

const dynamoDbAppConfigEntity = createEntity(dynamoMainTable);

export type DynamoDbAppConfigEntity = typeof dynamoDbAppConfigEntity;

export const DynamoDbAppConfig = {
  accessPattern: {
    getPK: AccessPattern.getPK,
    getSKforSpecificItem: AccessPattern.getSKforSpecificItem,
    getSKforAllItems: AccessPattern.getSKforAllItems,
  },
  entitySchema: ChannelConfigSchema,
  createEntity: createEntity,
  entity: dynamoDbAppConfigEntity,
};
