/* eslint-disable no-console */
import { parseArgs } from "node:util";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";

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
 * Checks if an item is an AppConfig entity (has encrypted spCode field).
 */
const isAppConfigItem = (
  item: Record<string, unknown>,
): item is Record<string, unknown> & { spCode: string } => {
  return typeof item.spCode === "string";
};

/**
 * Tries to decrypt a value with the primary key.
 * Returns the decrypted value if successful, null if decryption fails.
 */
const tryDecryptWithPrimaryKey = (encryptor: Encryptor, value: string): string | null => {
  try {
    return encryptor.decrypt(value);
  } catch {
    return null;
  }
};

/**
 * Tries to decrypt a value using fallback keys.
 * Returns the decrypted value if successful, throws if all keys fail.
 */
const decryptWithFallbackKeys = (fallbackKeys: string[], value: string): string => {
  for (let i = 0; i < fallbackKeys.length; i++) {
    try {
      const fallbackEncryptor = new Encryptor(fallbackKeys[i]);

      return fallbackEncryptor.decrypt(value);
    } catch {
      // continue to next fallback
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
  const primaryEncryptor = new Encryptor(env.SECRET_KEY);

  logger.info(`Scanning table: ${tableName}`);
  const allItems = await scanAllItems(documentClient, tableName);

  logger.info(`Found ${allItems.length} total items in table`);

  const configItems = allItems.filter(isAppConfigItem);

  logger.info(`Found ${configItems.length} AppConfig items with encrypted spCode field`);

  let reEncrypted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < configItems.length; i++) {
    const item = configItems[i];
    const itemId = `${String(item.PK)}/${String(item.SK)}`;

    try {
      // Check if spCode is already encrypted with primary key
      const decryptedWithPrimary = tryDecryptWithPrimaryKey(primaryEncryptor, item.spCode);

      if (decryptedWithPrimary !== null) {
        skipped++;
        logger.info(
          `[${i + 1}/${configItems.length}] Skipped (already using current key): ${itemId}`,
        );
        continue;
      }

      // Decrypt with fallback keys
      const decryptedSpCode = decryptWithFallbackKeys(fallbackKeys, item.spCode);

      // Re-encrypt with primary key
      const newSpCode = primaryEncryptor.encrypt(decryptedSpCode);

      if (!dryRun) {
        await documentClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              ...item,
              spCode: newSpCode,
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
