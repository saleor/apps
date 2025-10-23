import { Table } from "dynamodb-toolbox";

import { env } from "@/env";
import { createDocumentClient, createDynamoClient } from "@/modules/dynamodb/dynamo-client";

const docClient = createDocumentClient(createDynamoClient());

export const dynamoMainTable = new Table({
  documentClient: docClient,
  name: env.DYNAMODB_MAIN_TABLE_NAME,
  sortKey: {
    name: "SK",
    type: "string",
  },
  partitionKey: {
    name: "PK",
    type: "string",
  },
});
