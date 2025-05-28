import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

export const deleteTable = async (tableName: string) => {
  try {
    console.log("dropping table");

    await client.send(
      new DeleteTableCommand({
        TableName: tableName,
      }),
    );

    console.log("success: table deleted");
  } catch (e) {
    console.warn("Failed to delete table - it may already be removed", e);
  }
};
