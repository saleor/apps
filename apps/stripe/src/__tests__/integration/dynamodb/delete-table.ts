import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.INTEGRATION_DYNAMO_TABLE_NAME ?? "stripe-main-table-integration";

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
  } catch {
    console.warn("Failed to delete table - it may already exists");
  }
};
