import { type Logger } from "@saleor/apps-logger";

import type { IEncryptor } from "../encryptor";
import { Encryptor } from "../encryptor";
import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

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
    return tryDecryptWithFallback({
      value: text,
      primaryKey: this.primarySecret,
      fallbackKeys: this.fallbackSecrets,
      decryptFn: (value, key) => new Encryptor(key).decrypt(value),
      logger: this.logger,
    });
  }
}
