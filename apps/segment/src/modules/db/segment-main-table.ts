import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, schema, string, Table } from "dynamodb-toolbox";

import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/lib/dynamodb-client";

export class SegmentMainTable extends Table<
  { name: "PK"; type: "string" },
  {
    name: "SK";
    type: "string";
  }
> {
  private constructor(
    args: ConstructorParameters<
      typeof Table<
        { name: "PK"; type: "string" },
        {
          name: "SK";
          type: "string";
        }
      >
    >[number],
  ) {
    super(args);
  }

  static create({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }): SegmentMainTable {
    return new SegmentMainTable({
      documentClient,
      name: tableName,
      partitionKey: { name: "PK", type: "string" },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }

  static getAPLPrimaryKey({ saleorApiUrl }: { saleorApiUrl: string }) {
    return `${saleorApiUrl}` as const;
  }

  static getAPLSortKey() {
    return `APL` as const;
  }
}

const SegmentConfigTableSchema = {
  apl: schema({
    PK: string().key(),
    SK: string().key(),
    domain: string().optional(),
    token: string(),
    saleorApiUrl: string(),
    appId: string(),
    jwks: string().optional(),
  }),
};

export const client = createDynamoDBClient();

export const documentClient = createDynamoDBDocumentClient(client);

export const SegmentMainTableEntityFactory = {
  createAPLEntity: (table: SegmentMainTable) => {
    return new Entity({
      table,
      name: "APL",
      schema: SegmentConfigTableSchema.apl,
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
  },
};

export type SegmentAPLEntityType = ReturnType<typeof SegmentMainTableEntityFactory.createAPLEntity>;
