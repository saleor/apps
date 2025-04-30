import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";

import { env } from "./env";

// todo move to shared package
export class Encryptor {
  private secret: string;

  constructor(secret = env.SECRET_KEY) {
    this.secret = secret;
  }

  encrypt(text: string): string {
    return encrypt(text, this.secret);
  }

  decrypt(text: string): string {
    return decrypt(text, this.secret);
  }
}
