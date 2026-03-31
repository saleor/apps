import { describe, expect, it } from "vitest";

import { Encryptor } from "./encryptor";
import { RotatingEncryptor } from "./rotating-encryptor";

describe("RotatingEncryptor", () => {
  const KEY_A = "C2BBB6A1306F2103D1222BE09DC4364DEFDDCAC783CDE3CDE9F8A88D3D8B0442";
  const KEY_B = "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF";
  const KEY_C = "AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899";

  it("Encrypts with primary key and decrypts with RotatingEncryptor(KEY_A)", () => {
    const rotating = new RotatingEncryptor(KEY_A);
    const plaintext = "Hello World";

    const encrypted = rotating.encrypt(plaintext);
    const decrypted = rotating.decrypt(encrypted);

    expect(decrypted).toStrictEqual(plaintext);
  });

  it("Decrypts with fallback key when primary fails", () => {
    const encryptor = new Encryptor(KEY_A);
    const plaintext = "Secret Message";
    const encrypted = encryptor.encrypt(plaintext);

    const rotating = new RotatingEncryptor(KEY_B, [KEY_A]);
    const decrypted = rotating.decrypt(encrypted);

    expect(decrypted).toStrictEqual(plaintext);
  });

  it("Throws when no key can decrypt", () => {
    const encryptor = new Encryptor(KEY_A);
    const plaintext = "Secret Message";
    const encrypted = encryptor.encrypt(plaintext);

    const rotating = new RotatingEncryptor(KEY_B, [KEY_C]);

    expect(() => rotating.decrypt(encrypted)).toThrow(
      /Failed to decrypt with primary key and 1 fallback key\(s\)/,
    );
  });

  it("Always encrypts with primary key", () => {
    const rotating = new RotatingEncryptor(KEY_A);
    const plaintext = "Test Data";

    const encrypted = rotating.encrypt(plaintext);
    const decryptedWithPrimary = new Encryptor(KEY_A).decrypt(encrypted);

    expect(decryptedWithPrimary).toStrictEqual(plaintext);
  });

  it("Tries multiple fallbacks in order", () => {
    const encryptor = new Encryptor(KEY_A);
    const plaintext = "Multi Fallback Test - This is a longer message to ensure proper decryption";
    const encrypted = encryptor.encrypt(plaintext);

    const rotating = new RotatingEncryptor(KEY_C, [KEY_B, KEY_A]);
    const decrypted = rotating.decrypt(encrypted);

    expect(decrypted).toStrictEqual(plaintext);
  });

  it("Works with empty fallback array", () => {
    const rotating = new RotatingEncryptor(KEY_A, []);
    const plaintext = "No Fallback";

    const encrypted = rotating.encrypt(plaintext);
    const decrypted = rotating.decrypt(encrypted);

    expect(decrypted).toStrictEqual(plaintext);
  });

  it("Throws on invalid encrypted text", () => {
    const rotating = new RotatingEncryptor(KEY_A);

    expect(() => rotating.decrypt("invalid")).toThrow();
  });
});
