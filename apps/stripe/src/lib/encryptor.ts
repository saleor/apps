import { env } from "./env";

// todo move to shared package
export class Encryptor {
  private secret: string;

  constructor(secret = env.SECRET_KEY) {
    this.secret = secret;
  }

  encrypt(text: string): string {
    return text;
  }

  decrypt(text: string): string {
    return text;
  }
}
