import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

import { env } from "@/env";

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

export const createDynamoClient = (opts: DynamoDBClientOptions) => {
  const roleArn = env.AWS_ROLE_ARN;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  const region = env.AWS_REGION;

  let credentials: DynamoDBClientConfig["credentials"];

  if (roleArn) {
    credentials = awsCredentialsProvider({ roleArn });
  } else if (accessKeyId && secretAccessKey) {
    credentials = { accessKeyId, secretAccessKey };
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

export const createDocumentClient = (client: DynamoDBClient) => {
  return DynamoDBDocumentClient.from(client);
};
