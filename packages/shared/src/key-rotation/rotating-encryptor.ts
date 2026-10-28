import { type Logger } from "@saleor/apps-logger";

import type { IEncryptor } from "../encryptor";
import { Encryptor } from "../encryptor";
import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

/**
 * No configured key decrypts the value, e.g. it was encrypted with a key that is no longer
 * configured. Retrying won't help. `decryptionFailed` survives BaseError wrapping, which merges a
 * cause's own properties into the wrapping error.
 */
export class DecryptionError extends Error {
  readonly decryptionFailed = true;
}

export class RotatingEncryptor implements IEncryptor {
  private primaryEncryptor: Encryptor;
  private primarySecret: string;
  private fallbackSecrets: string[];
  private logger: Logger;

  constructor({
    primarySecret,
    fallbackSecrets,
    logger,
  }: {
    primarySecret: string;
    fallbackSecrets?: string[];
    logger: Logger;
  }) {
    this.primaryEncryptor = new Encryptor(primarySecret);
    this.primarySecret = primarySecret;
    this.fallbackSecrets = fallbackSecrets ?? [];
    this.logger = logger;
  }

  encrypt(text: string): string {
    return this.primaryEncryptor.encrypt(text);
  }

  decrypt(text: string): string {
    const result = tryDecryptWithFallback({
      value: text,
      primaryKey: this.primarySecret,
      fallbackKeys: this.fallbackSecrets,
      decryptFn: (value, key) => new Encryptor(key).decrypt(value),
    });

    if (result.status === "fallback") {
      this.logger.warn(
        `Decrypted using fallback key at index ${result.fallbackIndex}. ` +
          `Consider running migration to re-encrypt with current key.`,
      );
    }

    if (result.status === "failed") {
      const error = new DecryptionError(
        `Failed to decrypt with primary key and ${this.fallbackSecrets.length} fallback key(s).`,
      );

      this.logger.error(error.message);
      throw error;
    }

    return result.plaintext;
  }
}
