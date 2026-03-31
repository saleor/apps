import { decrypt } from "@saleor/app-sdk/settings-manager";

/**
 * Creates a decryptionMethod callback for EncryptedMetadataManager that
 * tries the primary key first, then each fallback key in order.
 *
 * The returned function signature matches SDK's DecryptCallback:
 * (value: string, secret: string) => string
 *
 * Note: the 'secret' arg from SDK is IGNORED — we use keys from closure.
 */
export function createRotatingDecryptCallback(
  primaryKey: string,
  fallbackKeys: string[],
): (value: string, secret: string) => string {
  return (value: string, _secret: string): string => {
    // Try primary key first
    try {
      return decrypt(value, primaryKey);
    } catch {
      // Try each fallback in order
      for (let i = 0; i < fallbackKeys.length; i++) {
        try {
          const result = decrypt(value, fallbackKeys[i]);

          // eslint-disable-next-line no-console
          console.warn(
            `[createRotatingDecryptCallback] Decrypted using fallback key at index ${i}. ` +
              `Consider running migration to re-encrypt with current key.`,
          );

          return result;
        } catch {
          // continue to next fallback
        }
      }
      throw new Error(
        `[createRotatingDecryptCallback] Failed to decrypt with primary key and ${fallbackKeys.length} fallback key(s).`,
      );
    }
  };
}
