import crypto from "node:crypto";

import { env } from "./env";

// todo move to shared package
export class Encryptor {
  private secret: string;

  constructor(secret = env.SECRET_KEY) {
    this.secret = secret;
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16); // 16 bytes IV for AES

    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(this.secret, "hex"), iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(":");

    if (!ivHex || !encryptedHex) throw new Error("Invalid input");

    const iv = Buffer.from(ivHex, "hex");
    const encryptedData = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(this.secret, "hex"), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted.toString();
  }
}
