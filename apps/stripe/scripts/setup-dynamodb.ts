/* eslint-disable no-console */
import { parseArgs } from "node:util";

import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";

const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;

try {
  const {
    values: { "endpoint-url": endpointUrl },
  } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "endpoint-url": {
        type: "string",
        short: "e",
        default: "http://localhost:8000",
      },
    },
  });

  console.log(`Starting DynamoDB setup with endpoint: ${endpointUrl}`);

  const dynamoClient = new DynamoDBClient({
    endpoint: endpointUrl,
    region: "localhost",
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
  });

  try {
    const possibleTable = await dynamoClient.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );

    if (possibleTable.Table) {
      console.log(`Table ${tableName} already exists - creation is skipped`);

      process.exit(0);
    }
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.log(`Table ${tableName} does not exist, proceeding with creation.`);
    } else {
      throw error; // Re-throw unexpected errors
    }
  }

  const createTableCommand = new CreateTableCommand({
    TableName: tableName,
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
    KeySchema: [
      {
        AttributeName: "PK",
        KeyType: "HASH",
      },
      {
        AttributeName: "SK",
        KeyType: "RANGE",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  await dynamoClient.send(createTableCommand);
  console.log(`Table ${tableName} created successfully`);
  process.exit(0);
} catch (error) {
  console.error("Error setting up DynamoDB:", error);
  process.exit(1);
}
