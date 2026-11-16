import { Entity, string } from "dynamodb-toolbox";
import { item } from "dynamodb-toolbox/schema/item";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

class AccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  static getSKforSpecificItem({
    configId,
    saleorUserId,
  }: {
    configId: string;
    saleorUserId: string;
  }) {
    return `STRIPE_CUSTOMER#${configId}#${saleorUserId}` as const;
  }
}

const Schema = item({
  PK: string().key(),
  SK: string().key(),
  configId: string(),
  saleorUserId: string(),
  stripeCustomerId: string(),
});

const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "StripeCustomerLink",
    schema: Schema,
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

const entity = createEntity(dynamoMainTable);

export type DynamoDbStripeCustomerLinkEntity = typeof entity;

export const DynamoDbStripeCustomerLink = {
  accessPattern: {
    getPK: AccessPattern.getPK,
    getSKforSpecificItem: AccessPattern.getSKforSpecificItem,
  },
  entitySchema: Schema,
  createEntity,
  entity,
};
