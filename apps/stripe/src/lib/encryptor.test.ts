import { describe, expect, it } from "vitest";

import { Encryptor } from "@/lib/encryptor";

describe("Encryptor", () => {
  it("Encrypts and decrypts a string", () => {
    const encryptionKey = "tq5FSykni9uGL05utFBISaxr0lCLtbBB";

    const encryptor = new Encryptor(encryptionKey);

    const string = "Hello World";

    const encryptedString = encryptor.encrypt(string);
    const decryptedString = encryptor.decrypt(encryptedString);

    expect(encryptedString).not.toStrictEqual(string);
    expect(decryptedString).toStrictEqual(string);
  });
});
