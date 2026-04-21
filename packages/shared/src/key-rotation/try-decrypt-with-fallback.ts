/**
 * Checks if a decrypted string looks like valid plaintext.
 *
 * Both encryption algorithms used in this repo:
 * @saleor/app-sdk - aes256, custom Encryptor classes - aes-256-cbc
 * use PKCS7 auto-padding (Node crypto default, neither calls setAutoPadding(false)).
 * Decrypting with a wrong key throws ~99.6% of the time due to invalid padding.
 * The remaining 1 out of 256 cases through when the last decrypted byte accidentally
 * forms valid PKCS7 padding (e.g. 0x01).
 *
 * When that happens, the decrypted bytes are random garbage. Node's Buffer.toString("utf8")
 * replaces invalid byte sequences with U+FFFD. Random bytes (in our app's usage) contain
 * invalid UTF-8, so checking for U+FFFD reliably catches these false positives.
 */
export function isPrintableText(text: string): boolean {
  return !text.includes("\uFFFD");
}

export type DecryptResult =
  | { status: "primary"; plaintext: string }
  | { status: "fallback"; plaintext: string; fallbackIndex: number }
  | { status: "failed" };

/**
 * Core key-rotation logic: try the primary key, then each fallback in order.
 *
 * AES-CBC has no built-in integrity check (unlike AES-GCM which verifies an authentication tag),
 * so decryption with a wrong key can occasionally succeed
 * when PKCS7 padding happens to validate (1 in 256 chance).
 * To guard against this, decrypted results are validated with `isPrintableText`
 * (or a custom `validateDecrypted` callback) before being accepted.
 */
export function tryDecryptWithFallback({
  value,
  primaryKey,
  fallbackKeys,
  decryptFn,
  validateDecrypted = isPrintableText,
}: {
  value: string;
  primaryKey: string;
  fallbackKeys: string[];
  decryptFn: (value: string, key: string) => string;
  validateDecrypted?: (plaintext: string) => boolean;
}): DecryptResult {
  try {
    const result = decryptFn(value, primaryKey);

    if (validateDecrypted(result)) {
      return { status: "primary", plaintext: result };
    }
  } catch {
    // Primary key failed, try fallbacks
  }

  for (let i = 0; i < fallbackKeys.length; i++) {
    try {
      const result = decryptFn(value, fallbackKeys[i]);

      if (validateDecrypted(result)) {
        return { status: "fallback", plaintext: result, fallbackIndex: i };
      }
    } catch {
      // continue to next fallback
    }
  }

  return { status: "failed" };
}
