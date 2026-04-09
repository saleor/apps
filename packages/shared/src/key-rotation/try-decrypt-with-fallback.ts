import { type Logger } from "@saleor/apps-logger";

/**
 * Core key-rotation logic: try the primary key, then each fallback in order.
 */
export function tryDecryptWithFallback({
  value,
  primaryKey,
  fallbackKeys,
  decryptFn,
  logger,
}: {
  value: string;
  primaryKey: string;
  fallbackKeys: string[];
  decryptFn: (value: string, key: string) => string;
  logger: Logger;
}): string {
  try {
    return decryptFn(value, primaryKey);
  } catch {
    for (let i = 0; i < fallbackKeys.length; i++) {
      try {
        const result = decryptFn(value, fallbackKeys[i]);

        logger.warn(
          `[tryDecryptWithFallback] Decrypted using fallback key at index ${i}. ` +
            `Consider running migration to re-encrypt with current key.`,
        );

        return result;
      } catch {
        // continue to next fallback
      }
    }

    const error = new Error(
      `[tryDecryptWithFallback] Failed to decrypt with primary key and ${fallbackKeys.length} fallback key(s).`,
    );

    logger.error(error.message);

    throw error;
  }
}
