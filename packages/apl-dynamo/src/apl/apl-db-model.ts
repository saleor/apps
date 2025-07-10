import { Entity, string, Table } from "dynamodb-toolbox";
import { item } from "dynamodb-toolbox/schema/item";

/**
 * Define minimum Table definition. Apps should at least extend these values.
 */
export type PartitionKey = { name: "PK"; type: "string" };
export type SortKey = { name: "SK"; type: "string" };
export type UsedTable = Table<PartitionKey, SortKey>;

export class AplAccessPattern {
  getPK({ saleorApiUrl }: { saleorApiUrl: string }) {
    /**
     * These PKs will be scoped tenant, so even after reinstalling they will be accessible
     */
    return `${saleorApiUrl}` as const;
  }
  /*
   * APL is singleton, PK will scope to specific installation,
   * So full path will be like this:
   * PK: <saleorApiUrl>#<appId>
   * SK: APL
   */
  getSK() {
    return `APL` as const;
  }
}

export const AplEntrySchema = item({
  PK: string().key(),
  SK: string().key(),
  token: string(),
  saleorApiUrl: string(),
  appId: string(),
  jwks: string().optional(),
});

export const createAplEntity = (table: UsedTable) => {
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

export type DynamoDbAplEntity = ReturnType<typeof createAplEntity>;
