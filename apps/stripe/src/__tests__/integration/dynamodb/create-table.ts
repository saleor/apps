/*
  eslint-disable no-console, n/no-process-env
*/

import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.INTEGRATION_DYNAMO_TABLE_NAME ?? "stripe-main-table-integration";

const client = new DynamoDBClient();

export const createTable = async () => {
  console.log("Creating table");

  try {
    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
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
    // todo stop printing aws output in case of success
  } catch (e) {
    console.error("Error creating table");
    console.error(e);
    throw new Error("Failed to create table", {
      cause: e,
    });
  }
};
