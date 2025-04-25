import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class StripeConfigAccessPattern {
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

const EntrySchema = schema({
  PK: string().key(),
  SK: string().key(),
  configName: string(),
  configId: string(),
  stripePk: string(),
  stripeRk: string(),
  stripeWhSecret: string(),
  stripeWhId: string(),
});

export const createStripeConfigEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "StripeConfig",
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

export const dynamoDbStripeConfigEntity = createStripeConfigEntity(dynamoMainTable);
export type DynamoDbStripeConfigEntity = typeof dynamoDbStripeConfigEntity;
