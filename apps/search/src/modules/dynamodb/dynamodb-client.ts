import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const createDynamoDBClient = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  const client = new DynamoDBClient({
    /**
     * We need to explicitly pass credentials to the client. If not set, SDK will take env variables.
     * Some time ago Vercel started to implicitly inject AWS_SESSION_TOKEN which took precedence over AWS_SECRET_ACCESS_KEY,
     * but it was not *our* token, but Vercel's.
     *
     * We should eventually move to OIDC
     */
    credentials:
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
    region,
  });

  return client;
};
export const createDynamoDBDocumentClient = (client: DynamoDBClient) => {
  return DynamoDBDocumentClient.from(client);
};
