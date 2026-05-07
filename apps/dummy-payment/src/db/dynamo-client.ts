import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

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

export const createDynamoDBClient = (opts: DynamoDBClientOptions): DynamoDBClient => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  const roleConfigured = process.env.AWS_ROLE_ARN !== undefined;
  const secretKeysConfigured = accessKeyId && secretAccessKey;

  let credentials: DynamoDBClientConfig["credentials"];

  /**
   * Take precedence for OIDC
   */
  if (roleConfigured) {
    credentials = awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN as string,
    });
  } else if (secretKeysConfigured) {
    /**
     * Accept access keys e.g. for local development
     */
    credentials = {
      accessKeyId,
      secretAccessKey,
    };
  }

  const client = new DynamoDBClient({
    requestHandler: {
      requestTimeout: opts.requestTimeout,
      connectionTimeout: opts.connectionTimeout,
    },
    maxAttempts: opts.maxAttempts,
    credentials,
    region,
  });

  return client;
};

export const createDynamoDBDocumentClient = (client: DynamoDBClient): DynamoDBDocumentClient => {
  return DynamoDBDocumentClient.from(client);
};
