import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, item, string, Table } from "dynamodb-toolbox";

export const bootstrapTest = () => {
  const client = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(client);
  const table = new Table({
    documentClient,
    name: "Test table",
    partitionKey: { name: "PK", type: "string" },
    sortKey: {
      name: "SK",
      type: "string",
    },
  });

  const toolboxSchema = item({
    PK: string().key(),
    SK: string().key(),
    configName: string(),
    configId: string(),
    token: string(),
  });

  const toolboxEntity = new Entity({
    table,
    name: "TestConfigEntity",
    schema: toolboxSchema,
    timestamps: {
      created: {
        name: "createdAt",
        savedAs: "createdAt",
      },
      modified: {
        name: "modifiedAt",
        savedAs: "modifiedAt",
      },
    },
  });

  return { table, toolboxEntity, toolboxSchema };
};
