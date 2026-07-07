import { type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";

import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/db/dynamo-client";
import { env } from "@/env";

/**
 * DynamoDB table for storing APL
 */
export class DynamoMainTable extends Table<
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
  }): DynamoMainTable {
    return new DynamoMainTable({
      documentClient,
      name: tableName,
      partitionKey: { name: "PK", type: "string" },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }

  static getPrimaryKey({
    saleorApiUrl,
    appId,
  }: {
    saleorApiUrl: string;
    appId: string;
  }): `${string}#${string}` {
    return `${saleorApiUrl}#${appId}` as const;
  }
}

const client = createDynamoDBClient({
  requestTimeout: env.DYNAMODB_MAIN_TABLE_TIMEOUT_MS,
  connectionTimeout: env.DYNAMODB_MAIN_TABLE_CONNECTION_TIMEOUT_MS,
});
const documentClient = createDynamoDBDocumentClient(client);

export const dynamoMainTable = DynamoMainTable.create({
  tableName: env.DYNAMODB_MAIN_TABLE_NAME as string,
  documentClient,
});
