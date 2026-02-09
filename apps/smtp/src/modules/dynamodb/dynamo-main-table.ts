import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";

import { env } from "../../env";
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

let _dynamoMainTable: DynamoMainTable | null = null;

/**
 * Get the DynamoDB main table instance.
 * Creates lazily to avoid errors when DynamoDB env vars are not set (e.g., when APL=file).
 */
export function getDynamoMainTable(): DynamoMainTable {
  if (_dynamoMainTable) {
    return _dynamoMainTable;
  }

  if (!env.DYNAMODB_MAIN_TABLE_NAME) {
    throw new Error(
      "DYNAMODB_MAIN_TABLE_NAME is required when using DynamoDB. Set APL=file for local development.",
    );
  }

  const client = createDynamoDBClient({
    connectionTimeout: env.DYNAMODB_CONNECTION_TIMEOUT_MS,
    requestTimeout: env.DYNAMODB_REQUEST_TIMEOUT_MS,
  });
  const documentClient = createDynamoDBDocumentClient(client);

  _dynamoMainTable = DynamoMainTable.create({
    documentClient: documentClient,
    tableName: env.DYNAMODB_MAIN_TABLE_NAME,
  });

  return _dynamoMainTable;
}

/*
 * Deprecated: Use getDynamoMainTable() instead
 * Kept for backward compatibility, but will throw if DynamoDB vars not set
 */
export const dynamoMainTable = new Proxy({} as DynamoMainTable, {
  get(_, prop) {
    const table = getDynamoMainTable();

    return (table as unknown as Record<string | symbol, unknown>)[prop];
  },
});
