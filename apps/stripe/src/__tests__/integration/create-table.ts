/*
  eslint-disable no-console
*/

import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

export const createTable = async (tableName: string) => {
  console.log("Creating table: ", tableName);

  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          {
            AttributeName: "PK",
            AttributeType: "S",
          },
          {
            AttributeName: "SK",
            AttributeType: "S",
          },
        ],
      }),
    );

    console.log("Table created");
  } catch (e) {
    console.error("Error creating table", e);
    throw new Error("Failed to create table", {
      cause: e,
    });
  }
};
