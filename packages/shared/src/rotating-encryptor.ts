import type { IEncryptor } from "./encryptor";
import { Encryptor } from "./encryptor";

export class RotatingEncryptor implements IEncryptor {
  private primaryEncryptor: Encryptor;
  private fallbackEncryptors: Encryptor[];

  constructor(primarySecret: string, fallbackSecrets: string[] = []) {
    this.primaryEncryptor = new Encryptor(primarySecret);
    this.fallbackEncryptors = fallbackSecrets.map((s) => new Encryptor(s));
  }

  encrypt(text: string): string {
    // Always encrypt with primary key
    return this.primaryEncryptor.encrypt(text);
  }

  decrypt(text: string): string {
    // Try primary first
    try {
      return this.primaryEncryptor.decrypt(text);
    } catch {
      // Try each fallback in order
      for (let i = 0; i < this.fallbackEncryptors.length; i++) {
        try {
          const result = this.fallbackEncryptors[i].decrypt(text);

          // eslint-disable-next-line no-console
          console.warn(
            `[RotatingEncryptor] Decrypted using fallback key at index ${i}. ` +
              `Consider running migration to re-encrypt with current key.`,
          );

          return result;
        } catch {
          // continue to next fallback
        }
      }

      throw new Error(
        `[RotatingEncryptor] Failed to decrypt with primary key and ${this.fallbackEncryptors.length} fallback key(s).`,
      );
    }
  }
}
