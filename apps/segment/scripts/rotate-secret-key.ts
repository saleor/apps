import { parseArgs } from "node:util";

import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { SecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/secret-key-rotation-runner";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";
import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/lib/dynamodb-client";

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

const documentClient = createDynamoDBDocumentClient(
  createDynamoDBClient({ requestTimeout: 30_000, connectionTimeout: 10_000 }),
);

async function* scanItems(tableName: string) {
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

const tableName = env.DYNAMODB_MAIN_TABLE_NAME;

const runner = new SecretKeyRotationRunner<Record<string, unknown>>({
  secretKey: env.SECRET_KEY,
  fallbackKeys: collectFallbackSecretKeys(env),
  dryRun: dryRun ?? false,
  logger,
  decrypt,
  encrypt,
  getItems: async function* () {
    for await (const item of scanItems(tableName)) {
      if (typeof item.encryptedSegmentWriteKey === "string") {
        yield {
          id: `${String(item.PK)}/${String(item.SK)}`,
          encryptedFields: [
            { name: "encryptedSegmentWriteKey", encryptedValue: item.encryptedSegmentWriteKey },
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
