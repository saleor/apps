import { parseArgs } from "node:util";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { SecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/secret-key-rotation-runner";

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

const scanAllItems = async (
  documentClient: DynamoDBDocumentClient,
  tableName: string,
): Promise<Record<string, unknown>[]> => {
  const items: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (result.Items) {
      items.push(...(result.Items as Record<string, unknown>[]));
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);

  return items;
};

const documentClient = createDocumentClient();
const tableName = env.DYNAMODB_MAIN_TABLE_NAME;

const runner = new SecretKeyRotationRunner<Record<string, unknown>>({
  secretKey: env.SECRET_KEY,
  fallbackKeys: collectFallbackSecretKeys(env),
  dryRun: dryRun ?? false,
  logger,
  decrypt: (value, key) => new Encryptor(key).decrypt(value),
  encrypt: (plaintext, key) => new Encryptor(key).encrypt(plaintext),
  getItems: async () => {
    const allItems = await scanAllItems(documentClient, tableName);

    return allItems
      .filter(
        (item): item is Record<string, unknown> & { spCode: string } =>
          typeof item.spCode === "string",
      )
      .map((item) => ({
        id: `${String(item.PK)}/${String(item.SK)}`,
        encryptedFields: [{ name: "spCode", encryptedValue: item.spCode }],
        original: item,
      }));
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
  .catch((error) => {
    // pass entire error for debugging
    // eslint-disable-next-line @saleor/saleor-app/logger-leak
    logger.error("Fatal error during secret key rotation", { error });
    process.exit(1);
  });
