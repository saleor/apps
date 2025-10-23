import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const createDynamoClient = () => {
  const client = new DynamoDBClient();

  return client;
};

export const createDocumentClient = (client: DynamoDBClient) => {
  return DynamoDBDocumentClient.from(client);
};
