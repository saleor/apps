import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const createLogsDynamoClient = () => {
  const client = new DynamoDBClient();

  return client;
};

export const createLogsDocumentClient = (client: DynamoDBClient) => {
  return DynamoDBDocumentClient.from(client);
};
