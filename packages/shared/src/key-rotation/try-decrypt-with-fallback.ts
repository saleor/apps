/**
 * Core key-rotation logic: try the primary key, then each fallback in order.
 */
export function tryDecryptWithFallback(opts: {
  value: string;
  primaryKey: string;
  fallbackKeys: string[];
  decryptFn: (value: string, key: string) => string;
}): string {
  try {
    return opts.decryptFn(opts.value, opts.primaryKey);
  } catch {
    for (let i = 0; i < opts.fallbackKeys.length; i++) {
      try {
        const result = opts.decryptFn(opts.value, opts.fallbackKeys[i]);

        // eslint-disable-next-line no-console
        console.warn(
          `[tryDecryptWithFallback] Decrypted using fallback key at index ${i}. ` +
          `Consider running migration to re-encrypt with current key.`,
        );

        return result;
      } catch {
        // continue to next fallback
      }
    }
    throw new Error(
      `[tryDecryptWithFallback] Failed to decrypt with primary key and ${opts.fallbackKeys.length} fallback key(s).`,
    );
  }
}
