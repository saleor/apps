import { Entity, string } from "dynamodb-toolbox";
import { item } from "dynamodb-toolbox/schema/item";

import { DynamoMainTable, dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

export class AplAccessPattern {
  static getPK({ saleorApiUrl }: { saleorApiUrl: string }) {
    /*
     * Main table holds access to PK.
     * In case of APL we only know saleorApiUrl, so we can't scope it per app ID
     */
    return DynamoMainTable.getPrimaryKeyScopedToSaleorApiUrl({ saleorApiUrl });
  }
  /*
   * APL is singleton, PK will scope to specific installation,
   * So full path will be like this:
   * PK: <saleorApiUrl>#<appId>
   * SK: APL
   */
  static getSK() {
    return `APL` as const;
  }
}

const AplEntrySchema = item({
  PK: string().key(),
  SK: string().key(),
  token: string(),
  saleorApiUrl: string(),
  appId: string(),
  jwks: string().optional(),
});

export const createAplEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "APL",
    schema: AplEntrySchema,
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

export const dynamoDbAplEntity = createAplEntity(dynamoMainTable);
export type DynamoDbAplEntity = typeof dynamoDbAplEntity;
