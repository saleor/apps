import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";

import { env } from "@/lib/env";
import {
  createDynamoDBClient,
  createDynamoDBDocumentClient,
} from "@/modules/dynamodb/dynamodb-client";

type PartitionKey = { name: "PK"; type: "string" };
type SortKey = { name: "SK"; type: "string" };

/**
 * This table is used to store all relevant data for the NP-Atobarai application meaning: APL, configuration, etc.
 */
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
}

const client = createDynamoDBClient();
const documentClient = createDynamoDBDocumentClient(client);

export const dynamoMainTable = DynamoMainTable.create({
  documentClient: documentClient,
  tableName: env.DYNAMODB_MAIN_TABLE_NAME,
});
