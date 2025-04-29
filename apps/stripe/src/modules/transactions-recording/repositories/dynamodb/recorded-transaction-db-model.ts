import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

class AccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  static getSKforSpecificItem({ paymentIntentId }: { paymentIntentId: StripePaymentIntentId }) {
    return `TRANSACTION#${paymentIntentId}` as const;
  }
}

const Schema = schema({
  PK: string().key(),
  SK: string().key(),
  paymentIntentId: string(),
  saleorTransactionId: string(),
  // TODO: Do we want to use DynamoDB enums?
  saleorTransactionFlow: string(),
  resolvedTransactionFlow: string(),
  selectedPaymentMethod: string(),
});

const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "RecordedTransaction",
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

export type DynamoDbRecordedTransactionEntity = typeof entity;

export const DynamoDbRecordedTransaction = {
  accessPattern: {
    getPK: AccessPattern.getPK,
    getSKforSpecificItem: AccessPattern.getSKforSpecificItem,
  },
  entitySchema: Schema,
  createEntity,
  entity: entity,
};
