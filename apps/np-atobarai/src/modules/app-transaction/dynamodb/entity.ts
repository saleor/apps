import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { anyOf, Entity, item, nul, string } from "dynamodb-toolbox";

import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

export const appTransactionSchema = item({
  PK: string().key(),
  SK: string().key(),
  atobaraiTransactionId: string(),
  saleorTrackingNumber: anyOf(string(), nul()),
});

export const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "AppTransaction",
    schema: appTransactionSchema,
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

export const appTransactionEntity = createEntity(dynamoMainTable);

export type DynamoDbAppTransactionEntity = typeof appTransactionEntity;

export const getPK = ({
  saleorApiUrl,
  appId,
}: {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
}): string => {
  return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
};

export const getSKForSpecificItem = ({
  atobaraiTransactionId,
}: {
  atobaraiTransactionId: AtobaraiTransactionId;
}): string => {
  return `TRANSACTION#${atobaraiTransactionId}` as const;
};
