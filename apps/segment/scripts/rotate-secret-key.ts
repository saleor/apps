/* eslint-disable no-console */
import { parseArgs } from "node:util";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";

import { env } from "@/env";

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

/**
 * Scans all items from the DynamoDB table, handling pagination.
 */
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

/**
 * Checks if an item is a Segment config entity (has encrypted write key field).
 */
const isSegmentConfigItem = (
  item: Record<string, unknown>,
): item is Record<string, unknown> & { encryptedSegmentWriteKey: string } => {
  return typeof item.encryptedSegmentWriteKey === "string";
};

/**
 * Tries to decrypt a value with the given key using SDK decrypt.
 * Returns the decrypted value if successful, null if decryption fails.
 */
const trySdkDecrypt = (value: string, key: string): string | null => {
  try {
    return decrypt(value, key);
  } catch {
    return null;
  }
};

/**
 * Tries to decrypt a value using fallback keys with SDK decrypt.
 * Returns the decrypted value if successful, throws if all keys fail.
 */
const decryptWithFallbackKeys = (fallbackKeys: string[], value: string): string => {
  for (let i = 0; i < fallbackKeys.length; i++) {
    const result = trySdkDecrypt(value, fallbackKeys[i]);

    if (result !== null) {
      return result;
    }
  }

  throw new Error(
    `Failed to decrypt with all ${fallbackKeys.length} fallback key(s). Value may be corrupted or keys are incorrect.`,
  );
};

const rotateSecretKey = async () => {
  const fallbackKeys = collectFallbackSecretKeys(env);

  if (fallbackKeys.length === 0) {
    logger.error(
      "No fallback keys configured. Set FALLBACK_SECRET_KEY_1 (and optionally _2, _3) env vars with the old key(s).",
    );
    process.exit(1);
  }

  logger.info(
    `Starting secret key rotation${dryRun ? " (DRY RUN)" : ""}. Fallback keys configured: ${
      fallbackKeys.length
    }`,
  );

  const documentClient = createDocumentClient();
  const tableName = env.DYNAMODB_MAIN_TABLE_NAME;

  logger.info(`Scanning table: ${tableName}`);
  const allItems = await scanAllItems(documentClient, tableName);

  logger.info(`Found ${allItems.length} total items in table`);

  const configItems = allItems.filter(isSegmentConfigItem);

  logger.info(`Found ${configItems.length} Segment config items with encrypted write key field`);

  let reEncrypted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < configItems.length; i++) {
    const item = configItems[i];
    const itemId = `${String(item.PK)}/${String(item.SK)}`;

    try {
      // Check if encryptedSegmentWriteKey is already encrypted with primary key
      const decryptedWithPrimary = trySdkDecrypt(item.encryptedSegmentWriteKey, env.SECRET_KEY);

      if (decryptedWithPrimary !== null) {
        skipped++;
        logger.info(
          `[${i + 1}/${configItems.length}] Skipped (already using current key): ${itemId}`,
        );
        continue;
      }

      // Decrypt with fallback keys
      const decryptedWriteKey = decryptWithFallbackKeys(
        fallbackKeys,
        item.encryptedSegmentWriteKey,
      );

      // Re-encrypt with primary key using SDK encrypt
      const newEncryptedWriteKey = encrypt(decryptedWriteKey, env.SECRET_KEY);

      if (!dryRun) {
        await documentClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              ...item,
              encryptedSegmentWriteKey: newEncryptedWriteKey,
            },
          }),
        );
      }

      reEncrypted++;
      logger.info(
        `[${i + 1}/${configItems.length}] Re-encrypted${dryRun ? " (dry run)" : ""}: ${itemId}`,
      );
    } catch (error) {
      failed++;
      logger.error(`[${i + 1}/${configItems.length}] Failed to process: ${itemId}`, {
        error,
      });
    }
  }

  logger.info(
    `\nMigration complete${
      dryRun ? " (DRY RUN)" : ""
    }. Re-encrypted: ${reEncrypted}, Skipped: ${skipped}, Failed: ${failed}`,
  );

  if (failed > 0) {
    logger.error(`${failed} item(s) failed. Review errors above.`);
    process.exit(1);
  }
};

rotateSecretKey().catch((error) => {
  logger.error("Fatal error during secret key rotation", { error });
  process.exit(1);
});
