import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const createDynamoDBClient = () => {
  const client = new DynamoDBClient();

  return client;
};

export const createDynamoDBDocumentClient = (client: DynamoDBClient) => {
  return DynamoDBDocumentClient.from(client);
};
