import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";

/**
 * Creates a decrypt function that tries the primary key first,
 * then each fallback key in order.
 *
 * The returned function has the same signature as SDK's decrypt:
 * (value: string, key: string) => string
 *
 * Note: the 'key' arg is IGNORED — we use keys from closure.
 * This is intentional: Segment's DynamoConfigMapper passes encryptionKey
 * as the second arg, but our wrapper uses the keys from factory closure.
 */
export function createRotatingSdkDecrypt(
  primaryKey: string,
  fallbackKeys: string[],
): (value: string, key: string) => string {
  return (value: string, _key: string): string => {
    try {
      return decrypt(value, primaryKey);
    } catch {
      for (let i = 0; i < fallbackKeys.length; i++) {
        try {
          const result = decrypt(value, fallbackKeys[i]);

          // eslint-disable-next-line no-console
          console.warn(
            `[createRotatingSdkDecrypt] Decrypted using fallback key at index ${i}. ` +
              `Consider running migration to re-encrypt with current key.`,
          );

          return result;
        } catch {
          // continue
        }
      }
      throw new Error(
        `[createRotatingSdkDecrypt] Failed to decrypt with primary key and ${fallbackKeys.length} fallback key(s).`,
      );
    }
  };
}

/**
 * Creates an encrypt function that always uses the primary key.
 * Returned function has same signature as SDK's encrypt.
 */
export function createRotatingSdkEncrypt(
  primaryKey: string,
): (value: string, key: string) => string {
  return (value: string, _key: string): string => {
    return encrypt(value, primaryKey);
  };
}
