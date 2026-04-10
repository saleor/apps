import { type Logger } from "@saleor/apps-logger";

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
    const { secretKey, fallbackKeys, logger, decrypt, encrypt } = this.config;
    const progress = `[${index + 1}]`;

    const reEncryptedFields: Record<string, string> = {};
    let skipped = 0;
    let failed = 0;

    for (const field of item.encryptedFields) {
      try {
        decrypt(field.encryptedValue, secretKey);
        skipped++;
        logger.info(`${progress} [${field.name}] Already current, skipping`);
        continue;
      } catch {
        // Not encrypted with primary key, try fallbacks
      }

      let plaintext: string | null = null;

      for (const fallbackKey of fallbackKeys) {
        try {
          plaintext = decrypt(field.encryptedValue, fallbackKey);
          break;
        } catch {
          // continue to next fallback key
        }
      }

      if (plaintext === null) {
        failed++;
        logger.error(`${progress} [${field.name}] Failed to decrypt with any key`);
        continue;
      }

      reEncryptedFields[field.name] = encrypt(plaintext, secretKey);
    }

    return { reEncryptedFields, skipped, failed };
  };

  private processBatch = async (
    batch: RotationItem<T>[],
    startIndex: number,
  ): Promise<{ rotated: number; skipped: number; failed: number }> => {
    const { dryRun, logger, saveItem } = this.config;

    const results = await Promise.allSettled(
      batch.map(async (item, batchIndex) => {
        const globalIndex = startIndex + batchIndex;

        const {
          reEncryptedFields,
          skipped: itemSkipped,
          failed: itemFailed,
        } = this.processItem(item, globalIndex);

        const fieldsToSave = Object.keys(reEncryptedFields).length;

        if (!dryRun && fieldsToSave > 0) {
          await saveItem({ id: item.id, reEncryptedFields, original: item.original });
        }

        if (fieldsToSave > 0) {
          logger.info(
            `[${globalIndex + 1}] Re-encrypted ${fieldsToSave} field(s)${
              dryRun ? " (dry run)" : ""
            }: ${item.id}`,
          );
        }

        return { rotated: fieldsToSave, skipped: itemSkipped, failed: itemFailed };
      }),
    );

    let rotated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (result.status === "fulfilled") {
        rotated += result.value.rotated;
        skipped += result.value.skipped;
        failed += result.value.failed;
      } else {
        const item = batch[i];

        failed += item.encryptedFields.length;
        logger.error(`Failed to process item: ${item.id}`, {
          error: result.reason as Record<string, unknown>,
        });
      }
    }

    return { rotated, skipped, failed };
  };

  public run = async (): Promise<{ rotated: number; skipped: number; failed: number }> => {
    const { fallbackKeys, logger, getItems, concurrency = 5 } = this.config;

    if (fallbackKeys.length === 0) {
      throw new Error(
        "No fallback keys configured. Set FALLBACK_SECRET_KEY_1 (and optionally _2, _3) env vars with the old key(s).",
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
        batch = [];
      }
    }

    if (batch.length > 0) {
      const result = await this.processBatch(batch, processed);

      processed += batch.length;
      rotated += result.rotated;
      skipped += result.skipped;
      failed += result.failed;
    }

    logger.info(
      `Rotation complete${
        this.config.dryRun ? " (DRY RUN)" : ""
      }. Processed: ${processed}, Rotated: ${rotated}, Skipped: ${skipped}, Failed: ${failed}`,
    );

    if (failed > 0) {
      logger.error(`${failed} field(s) failed. Review errors above.`);
    }

    return { rotated, skipped, failed };
  };
}
