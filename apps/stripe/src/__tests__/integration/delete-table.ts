/*
  eslint-disable no-console, n/no-process-env
 */

import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_MAIN_TABLE_NAME;

const client = new DynamoDBClient();

export const deleteTable = async () => {
  try {
    console.log("dropping table");

    await client.send(
      new DeleteTableCommand({
        TableName: TABLE_NAME,
      }),
    );

    console.log("success: table deleted");
  } catch (e) {
    console.warn("Failed to delete table - it may already be removed", e);
  }
};
