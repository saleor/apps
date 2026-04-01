import type { IEncryptor } from "../encryptor";
import { Encryptor } from "../encryptor";
import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

export class RotatingEncryptor implements IEncryptor {
  private primaryEncryptor: Encryptor;
  private primarySecret: string;
  private fallbackSecrets: string[];

  constructor(primarySecret: string, fallbackSecrets: string[] = []) {
    this.primaryEncryptor = new Encryptor(primarySecret);
    this.primarySecret = primarySecret;
    this.fallbackSecrets = fallbackSecrets;
  }

  encrypt(text: string): string {
    return this.primaryEncryptor.encrypt(text);
  }

  decrypt(text: string): string {
    return tryDecryptWithFallback({
      value: text,
      primaryKey: this.primarySecret,
      fallbackKeys: this.fallbackSecrets,
      decryptFn: (value, key) => new Encryptor(key).decrypt(value),
    });
  }
}
