import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";

import { type DynamoEnv } from "../env-dynamodb";
import { createDynamoDBClient, createDynamoDBDocumentClient } from "./dynamodb-client";

type PartitionKey = { name: "PK"; type: "string" };
type SortKey = { name: "SK"; type: "string" };

export class DynamoMainTable extends Table<PartitionKey, SortKey> {
  private constructor(args: ConstructorParameters<typeof Table<PartitionKey, SortKey>>[number]) {
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

  /**
   * These PKs will be scoped per installation, so reinstalling the app will not access this data.
   * Use Case: Logs, config, transactions.
   */
  static getPrimaryKeyScopedToInstallation({
    saleorApiUrl,
    appId,
  }: {
    saleorApiUrl: string;
    appId: string;
  }): `${string}#${string}` {
    return `${saleorApiUrl}#${appId}` as const;
  }

  /**
   * These PKs will be scoped tenant, so even after reinstalling they will be accessible
   * Use case: APL
   */
  static getPrimaryKeyScopedToSaleorApiUrl({
    saleorApiUrl,
  }: {
    saleorApiUrl: string;
  }): `${string}` {
    return `${saleorApiUrl}` as const;
  }
}

export function createDynamoMainTable(dynamoEnv: DynamoEnv): DynamoMainTable {
  const client = createDynamoDBClient({
    connectionTimeout: dynamoEnv.DYNAMODB_CONNECTION_TIMEOUT_MS,
    requestTimeout: dynamoEnv.DYNAMODB_REQUEST_TIMEOUT_MS,
    region: dynamoEnv.AWS_REGION,
    accessKeyId: dynamoEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: dynamoEnv.AWS_SECRET_ACCESS_KEY,
  });
  const documentClient = createDynamoDBDocumentClient(client);

  return DynamoMainTable.create({
    documentClient,
    tableName: dynamoEnv.DYNAMODB_MAIN_TABLE_NAME,
  });
}
