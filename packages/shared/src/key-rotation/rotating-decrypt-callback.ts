import { decrypt } from "@saleor/app-sdk/settings-manager";
import { type Logger } from "@saleor/apps-logger";

import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

/**
 * Creates a decrypt callback compatible with SDK's EncryptedMetadataManager
 * and any other code expecting `(value: string, key: string) => string`.
 *
 * The second argument (`secret`/`key`) is IGNORED — keys come from the closure.
 * This is intentional: SDK's EncryptedMetadataManager and code like
 * Segment's DynamoConfigMapper pass their own key as the second arg,
 * but our wrapper uses the keys provided at construction time.
 */
export function createRotatingDecryptCallback(
  primaryKey: string,
  fallbackKeys: string[],
  logger: Logger,
): (value: string, secret: string) => string {
  return (value: string, _secret: string): string => {
    const result = tryDecryptWithFallback({
      value,
      primaryKey,
      fallbackKeys,
      decryptFn: decrypt,
    });

    if (result.status === "fallback") {
      logger.warn(
        `Decrypted using fallback key at index ${result.fallbackIndex}. ` +
          `Consider running migration to re-encrypt with current key.`,
      );
    }

    if (result.status === "failed") {
      const error = new Error(
        `Failed to decrypt with primary key and ${fallbackKeys.length} fallback key(s).`,
      );

      logger.error(error.message);
      throw error;
    }

    return result.plaintext;
  };
}
