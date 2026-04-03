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

interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

interface SecretKeyRotationRunnerConfig<T = unknown> {
  secretKey: string;
  fallbackKeys: string[];
  dryRun: boolean;
  logger: Logger;
  /** Max concurrent saveItem calls. Defaults to 5. */
  concurrency?: number;
  getItems: () => Promise<RotationItem<T>[]>;
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
    total: number,
  ): { reEncryptedFields: Record<string, string>; skipped: number; failed: number } => {
    const { secretKey, fallbackKeys, logger, decrypt, encrypt } = this.config;
    const progress = `[${index + 1}/${total}]`;

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

  public run = async (): Promise<{ rotated: number; skipped: number; failed: number }> => {
    const { fallbackKeys, dryRun, logger, getItems, saveItem, concurrency = 5 } = this.config;

    if (fallbackKeys.length === 0) {
      throw new Error(
        "No fallback keys configured. Set FALLBACK_SECRET_KEY_1 (and optionally _2, _3) env vars with the old key(s).",
      );
    }

    logger.info(
      `Starting secret key rotation${dryRun ? " (DRY RUN)" : ""}. Fallback keys: ${fallbackKeys.length}, concurrency: ${concurrency}`,
    );

    const items = await getItems();

    logger.info(`Found ${items.length} item(s) to process`);

    let rotated = 0;
    let skipped = 0;
    let failed = 0;

    for (let batchStart = 0; batchStart < items.length; batchStart += concurrency) {
      const batch = items.slice(batchStart, batchStart + concurrency);

      const results = await Promise.allSettled(
        batch.map(async (item, batchIndex) => {
          const globalIndex = batchStart + batchIndex;
          const progress = `[${globalIndex + 1}/${items.length}]`;

          const { reEncryptedFields, skipped: itemSkipped, failed: itemFailed } =
            this.processItem(item, globalIndex, items.length);

          const fieldsToSave = Object.keys(reEncryptedFields).length;

          if (!dryRun && fieldsToSave > 0) {
            await saveItem({ id: item.id, reEncryptedFields, original: item.original });
          }

          if (fieldsToSave > 0) {
            logger.info(
              `${progress} Re-encrypted ${fieldsToSave} field(s)${dryRun ? " (dry run)" : ""}: ${item.id}`,
            );
          }

          return { rotated: fieldsToSave, skipped: itemSkipped, failed: itemFailed };
        }),
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status === "fulfilled") {
          rotated += result.value.rotated;
          skipped += result.value.skipped;
          failed += result.value.failed;
        } else {
          const item = batch[i];

          failed += item.encryptedFields.length;
          logger.error(
            `[${batchStart + i + 1}/${items.length}] Failed to process item: ${item.id}`,
            { error: result.reason as Record<string, unknown> },
          );
        }
      }
    }

    logger.info(
      `Rotation complete${dryRun ? " (DRY RUN)" : ""}. Rotated: ${rotated}, Skipped: ${skipped}, Failed: ${failed}`,
    );

    if (failed > 0) {
      logger.error(`${failed} field(s) failed. Review errors above.`);
    }

    return { rotated, skipped, failed };
  };
}
