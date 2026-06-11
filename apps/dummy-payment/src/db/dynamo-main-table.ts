import { type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";
import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/db/dynamo-client";


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
  requestTimeout: parseInt((process.env.DYNAMODB_MAIN_TABLE_TIMEOUT_MS as string) ?? 2000, 10),
  connectionTimeout: parseInt(process.env.DYNAMODB_MAIN_TABLE_CONNECTION_TIMEOUT_MS as string ?? 5000, 10),
});
const documentClient = createDynamoDBDocumentClient(client);

export const dynamoMainTable = DynamoMainTable.create({
  tableName: process.env.DYNAMODB_MAIN_TABLE_NAME as string,
  documentClient,
});
