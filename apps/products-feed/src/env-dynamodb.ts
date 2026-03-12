import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const dynamoOptionalEnv = createEnv({
  server: {
    DYNAMODB_MAIN_TABLE_NAME: z.string().optional(),
    DYNAMODB_REQUEST_TIMEOUT_MS: z.coerce.number().default(5_000),
    DYNAMODB_CONNECTION_TIMEOUT_MS: z.coerce.number().default(2_000),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
  },
  runtimeEnv: {
    DYNAMODB_MAIN_TABLE_NAME: process.env.DYNAMODB_MAIN_TABLE_NAME,
    DYNAMODB_REQUEST_TIMEOUT_MS: process.env.DYNAMODB_REQUEST_TIMEOUT_MS,
    DYNAMODB_CONNECTION_TIMEOUT_MS: process.env.DYNAMODB_CONNECTION_TIMEOUT_MS,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});

const dynamoEnvSchema = z.object({
  DYNAMODB_MAIN_TABLE_NAME: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  DYNAMODB_REQUEST_TIMEOUT_MS: z.number(),
  DYNAMODB_CONNECTION_TIMEOUT_MS: z.number(),
});

export type DynamoEnv = z.infer<typeof dynamoEnvSchema>;

export function getDynamoEnv(): DynamoEnv {
  return dynamoEnvSchema.parse(dynamoOptionalEnv);
}
