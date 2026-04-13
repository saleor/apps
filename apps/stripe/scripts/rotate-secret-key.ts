import { parseArgs } from "node:util";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { SecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/secret-key-rotation-runner";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

import { createMigrationScriptLogger } from "./migration-logger";

const {
  values: { "dry-run": dryRun },
} = parseArgs({
  options: {
    "dry-run": {
      type: "boolean",
      default: false,
    },
  },
});

const logger = createMigrationScriptLogger("RotateSecretKey");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const createDocumentClient = () => {
  const client = new DynamoDBClient({
    credentials:
      env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    region: env.AWS_REGION,
  });

  return DynamoDBDocumentClient.from(client);
};

async function* scanItems(documentClient: DynamoDBDocumentClient, tableName: string) {
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (result.Items) {
      yield* result.Items as Record<string, unknown>[];
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);
}

const documentClient = createDocumentClient();
const tableName = env.DYNAMODB_MAIN_TABLE_NAME;

const runner = new SecretKeyRotationRunner<Record<string, unknown>>({
  secretKey: env.SECRET_KEY,
  fallbackKeys: collectFallbackSecretKeys(env),
  dryRun: dryRun ?? false,
  logger,
  decrypt: (value, key) => new Encryptor(key).decrypt(value),
  encrypt: (plaintext, key) => new Encryptor(key).encrypt(plaintext),
  getItems: async function* () {
    for await (const item of scanItems(documentClient, tableName)) {
      if (typeof item.stripeRk === "string" && typeof item.stripeWhSecret === "string") {
        yield {
          id: `${String(item.PK)}/${String(item.SK)}`,
          encryptedFields: [
            { name: "stripeRk", encryptedValue: item.stripeRk },
            { name: "stripeWhSecret", encryptedValue: item.stripeWhSecret },
          ],
          original: item,
        };
      }
    }
  },
  saveItem: async (rotated) => {
    await documentClient.send(
      new PutCommand({
        TableName: tableName,
        Item: { ...rotated.original, ...rotated.reEncryptedFields },
      }),
    );
  },
});

runner
  .run()
  .then(({ failed }) => {
    if (failed > 0) process.exit(1);
  })
  .catch(async (error) => {
    logger.error("Fatal error during secret key rotation", { error: error });
    Sentry.captureException(error);
    await Sentry.flush(5000);
    process.exit(1);
  });
