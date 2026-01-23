import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

interface DynamoDBClientOptions {
  /**
   * Time in milliseconds after which the DynamoDB request fails.
   * @required Must be set, otherwise request will run indefinitely.
   */
  requestTimeout: number;
  /**
   * Maximum time in milliseconds for the connection phase (DNS/TCP/TLS).
   * @required Must be set, otherwise connection can establish indefinitely.
   */
  connectionTimeout: number;
  /**
   * Maximum retry attempts for retryable failures.
   * @default 3 (AWS SDK default)
   */
  maxAttempts?: number;
}

export const createDynamoDBClient = (opts: DynamoDBClientOptions) => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  const client = new DynamoDBClient({
    requestHandler: {
      requestTimeout: opts.requestTimeout,
      connectionTimeout: opts.connectionTimeout,
    },
    maxAttempts: opts.maxAttempts,
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
