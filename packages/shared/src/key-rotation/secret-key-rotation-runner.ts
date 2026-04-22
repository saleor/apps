import { type Logger } from "@saleor/apps-logger";

import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

/**
 * Thrown by `saveItem` implementations when the underlying storage reports that
 * the item was changed by another writer after the runner read it. The runner
 * treats this as a non-fatal skip: the item will be re-evaluated on the next
 * rotation run.
 */
export class ItemConcurrentlyModifiedError extends Error {
  readonly name = "ItemConcurrentlyModifiedError";
}

export interface EncryptedField {
  name: string;
  encryptedValue: string;
}

export interface RotationItem<T = unknown> {
  id: string;
  encryptedFields: EncryptedField[];
  original: T;
}

export interface RotatedItem<T = unknown> {
  id: string;
  reEncryptedFields: Record<string, string>;
  original: T;
}

interface SecretKeyRotationRunnerConfig<T = unknown> {
  secretKey: string;
  fallbackKeys: string[];
  dryRun: boolean;
  logger: Pick<Logger, "info" | "error">;
  /** Max concurrent saveItem calls. Defaults to 5. */
  concurrency?: number;
  getItems: () => AsyncIterable<RotationItem<T>>;
  decrypt: (encryptedValue: string, key: string) => string;
  encrypt: (plaintext: string, key: string) => string;
  saveItem: (item: RotatedItem<T>) => Promise<void>;
}

export class SecretKeyRotationRunner<T = unknown> {
  private readonly config: SecretKeyRotationRunnerConfig<T>;

  constructor(config: SecretKeyRotationRunnerConfig<T>) {
    this.config = config;
  }

  private processItem = (
    item: RotationItem<T>,
    index: number,
  ): { reEncryptedFields: Record<string, string>; skipped: number; failed: number } => {
    const { secretKey, fallbackKeys, logger, encrypt, decrypt } = this.config;
    const progress = `[${index + 1}]`;

    const reEncryptedFields: Record<string, string> = {};
    let skipped = 0;
    let failed = 0;

    for (const field of item.encryptedFields) {
      const result = tryDecryptWithFallback({
        value: field.encryptedValue,
        primaryKey: secretKey,
        fallbackKeys,
        decryptFn: decrypt,
      });

      switch (result.status) {
        case "primary":
          skipped++;
          logger.info(`${progress} [${field.name}] Already current, skipping`);
          break;

        case "fallback":
          reEncryptedFields[field.name] = encrypt(result.plaintext, secretKey);
          break;

        case "failed":
          failed++;
          logger.error(`${progress} [${field.name}] Failed to decrypt with any key`);
          break;
      }
    }

    return { reEncryptedFields, skipped, failed };
  };

  private processBatch = async (
    batch: RotationItem<T>[],
    startIndex: number,
  ): Promise<{
    rotated: number;
    skipped: number;
    failed: number;
    concurrentlyModified: number;
  }> => {
    const { dryRun, logger, saveItem } = this.config;

    const results = await Promise.all(
      batch.map(async (item, batchIndex) => {
        const globalIndex = startIndex + batchIndex;

        const {
          reEncryptedFields,
          skipped: itemSkipped,
          failed: itemFailed,
        } = this.processItem(item, globalIndex);

        const fieldsToSave = Object.keys(reEncryptedFields).length;

        try {
          if (!dryRun && fieldsToSave > 0) {
            await saveItem({ id: item.id, reEncryptedFields, original: item.original });
          }
        } catch (error) {
          if (error instanceof ItemConcurrentlyModifiedError) {
            logger.info(
              `[${globalIndex + 1}] Item changed under rotation, leaving for next run: ${item.id}`,
            );

            return {
              rotated: 0,
              skipped: itemSkipped,
              failed: itemFailed,
              concurrentlyModified: fieldsToSave,
            };
          }

          logger.error(`Failed to save item: ${item.id}`, {
            error: error as Record<string, unknown>,
          });

          return {
            rotated: 0,
            skipped: itemSkipped,
            failed: itemFailed + fieldsToSave,
            concurrentlyModified: 0,
          };
        }

        if (fieldsToSave > 0) {
          logger.info(
            `[${globalIndex + 1}] Re-encrypted ${fieldsToSave} field(s)${
              dryRun ? " (dry run)" : ""
            }: ${item.id}`,
          );
        }

        return {
          rotated: fieldsToSave,
          skipped: itemSkipped,
          failed: itemFailed,
          concurrentlyModified: 0,
        };
      }),
    );

    let rotated = 0;
    let skipped = 0;
    let failed = 0;
    let concurrentlyModified = 0;

    for (const result of results) {
      rotated += result.rotated;
      skipped += result.skipped;
      failed += result.failed;
      concurrentlyModified += result.concurrentlyModified;
    }

    return { rotated, skipped, failed, concurrentlyModified };
  };

  public run = async (): Promise<{
    rotated: number;
    skipped: number;
    failed: number;
    concurrentlyModified: number;
  }> => {
    const { fallbackKeys, logger, getItems, concurrency = 5 } = this.config;

    if (fallbackKeys.length === 0) {
      throw new Error(
        "No fallback keys configured. Rotation needs at least one decrypt source key (e.g. the current SECRET_KEY).",
      );
    }

    logger.info(
      `Starting secret key rotation${this.config.dryRun ? " (DRY RUN)" : ""}. Fallback keys: ${
        fallbackKeys.length
      }, concurrency: ${concurrency}`,
    );

    let rotated = 0;
    let skipped = 0;
    let failed = 0;
    let concurrentlyModified = 0;
    let processed = 0;
    let batch: RotationItem<T>[] = [];

    for await (const item of getItems()) {
      batch.push(item);

      if (batch.length >= concurrency) {
        const result = await this.processBatch(batch, processed);

        processed += batch.length;
        rotated += result.rotated;
        skipped += result.skipped;
        failed += result.failed;
        concurrentlyModified += result.concurrentlyModified;
        batch = [];
      }
    }

    if (batch.length > 0) {
      const result = await this.processBatch(batch, processed);

      processed += batch.length;
      rotated += result.rotated;
      skipped += result.skipped;
      failed += result.failed;
      concurrentlyModified += result.concurrentlyModified;
    }

    logger.info(
      `Rotation complete${
        this.config.dryRun ? " (DRY RUN)" : ""
      }. Processed: ${processed}, Rotated: ${rotated}, Skipped: ${skipped}, Failed: ${failed}, Concurrently modified: ${concurrentlyModified}`,
    );

    if (failed > 0) {
      logger.error(`${failed} field(s) failed. Review errors above.`);
    }

    return { rotated, skipped, failed, concurrentlyModified };
  };
}
