import { describe, expect, it } from "vitest";

import { Encryptor } from "@/lib/encryptor";

describe("Encryptor", () => {
  it("Encrypts and decrypts a string", () => {
    const encryptionKey = "C2BBB6A1306F2103D1222BE09DC4364DEFDDCAC783CDE3CDE9F8A88D3D8B0442";

    const encryptor = new Encryptor(encryptionKey);

    const string = "Hello World";

    const encryptedString = encryptor.encrypt(string);
    const decryptedString = encryptor.decrypt(encryptedString);

    expect(encryptedString).not.toStrictEqual(string);
    expect(decryptedString).toStrictEqual(string);
  });
});
