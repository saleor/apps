import { Entity, string } from "dynamodb-toolbox";
import { item } from "dynamodb-toolbox/schema/item";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

class StripeConfigAccessPattern {
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

const DynamoDbStripeConfigSchema = item({
  PK: string().key(),
  SK: string().key(),
  configName: string(),
  configId: string(),
  stripePk: string(),
  stripeRk: string(),
  stripeWhSecret: string(),
  stripeWhId: string(),
});

const createStripeConfigEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "StripeConfig",
    schema: DynamoDbStripeConfigSchema,
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

const dynamoDbStripeConfigEntity = createStripeConfigEntity(dynamoMainTable);

export type DynamoDbStripeConfigEntity = typeof dynamoDbStripeConfigEntity;

export const DynamoDbStripeConfig = {
  accessPattern: {
    getPK: StripeConfigAccessPattern.getPK,
    getSKforSpecificItem: StripeConfigAccessPattern.getSKforSpecificItem,
    getSKforAllItems: StripeConfigAccessPattern.getSKforAllItems,
  },
  entitySchema: DynamoDbStripeConfigSchema,
  createEntity: createStripeConfigEntity,
  entity: dynamoDbStripeConfigEntity,
};
