import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { anyOf, Entity, item, nul, string } from "dynamodb-toolbox";

import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

const schema = item({
  PK: string().key(),
  SK: string().key(),
  atobaraiTransactionId: string(),
  saleorTrackingNumber: anyOf(string(), nul()),
  saleorMetadataShippingCompanyCode: anyOf(string(), nul()),
});

const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "AppTransaction",
    schema,
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

const getPK = ({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }): string => {
  return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
};

const getSKForSpecificItem = ({
  atobaraiTransactionId,
}: {
  atobaraiTransactionId: AtobaraiTransactionId;
}): string => {
  return `TRANSACTION#${atobaraiTransactionId}` as const;
};

export type TransactionRecordEntity = typeof TransactionRecordConfig.entity;

export const TransactionRecordConfig = {
  accessPattern: {
    getPK,
    getSKForSpecificItem,
  },
  entity: createEntity(dynamoMainTable),
  createEntity,
  entitySchema: schema,
};
