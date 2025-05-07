/*
  eslint-disable no-console, n/no-process-env
 */

import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.INTEGRATION_DYNAMO_TABLE_NAME ?? "stripe-main-table-integration";

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
  region: "localhost",
  endpoint: "http://localhost:8000",
});

export const deleteTable = async () => {
  try {
    console.log("dropping table");

    await client.send(
      new DeleteTableCommand({
        TableName: TABLE_NAME,
      }),
    );

    console.log("success: table deleted");
  } catch (err: unknown) {
    console.error("Failed to delete table", err);
  }
};
