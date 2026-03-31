import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";

import { Encryptor } from "./encryptor";
import { createRotatingSdkDecrypt, createRotatingSdkEncrypt } from "./rotating-sdk-decrypt";

const PRIMARY_KEY = "primary-key-for-testing";
const FALLBACK_KEY_1 = "fallback-key-one";
const FALLBACK_KEY_2 = "fallback-key-two";
const TEST_VALUE = "test-secret-data";

describe("rotating-sdk-decrypt", () => {
  describe("createRotatingSdkDecrypt", () => {
    it("should decrypt with primary key when it matches", () => {
      const encrypted = encrypt(TEST_VALUE, PRIMARY_KEY);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, []);

      const result = decryptFn(encrypted, PRIMARY_KEY);

      expect(result).toBe(TEST_VALUE);
    });

    it("should decrypt with fallback key when primary fails", () => {
      const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_1);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, [FALLBACK_KEY_1]);

      const result = decryptFn(encrypted, PRIMARY_KEY);

      expect(result).toBe(TEST_VALUE);
    });

    it("should throw when no key matches", () => {
      const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_1);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, [FALLBACK_KEY_2]);

      expect(() => decryptFn(encrypted, PRIMARY_KEY)).toThrow(
        "[createRotatingSdkDecrypt] Failed to decrypt with primary key and 1 fallback key(s).",
      );
    });

    it("should try multiple fallback keys in order", () => {
      const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_2);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, [FALLBACK_KEY_1, FALLBACK_KEY_2]);

      const result = decryptFn(encrypted, PRIMARY_KEY);

      expect(result).toBe(TEST_VALUE);
    });

    it("should decrypt using second fallback key when first fallback also fails", () => {
      const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_2);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, [FALLBACK_KEY_1, FALLBACK_KEY_2]);

      const result = decryptFn(encrypted, PRIMARY_KEY);

      expect(result).toBe(TEST_VALUE);
    });

    it("should ignore the key parameter and use closure keys", () => {
      const encrypted = encrypt(TEST_VALUE, PRIMARY_KEY);
      const decryptFn = createRotatingSdkDecrypt(PRIMARY_KEY, []);

      const result = decryptFn(encrypted, "some-other-key");

      expect(result).toBe(TEST_VALUE);
    });
  });

  describe("createRotatingSdkEncrypt", () => {
    it("should encrypt with primary key", () => {
      const encryptFn = createRotatingSdkEncrypt(PRIMARY_KEY);

      const encrypted = encryptFn(TEST_VALUE, PRIMARY_KEY);
      const decrypted = decrypt(encrypted, PRIMARY_KEY);

      expect(decrypted).toBe(TEST_VALUE);
    });

    it("should ignore the key parameter and use primary key", () => {
      const encryptFn = createRotatingSdkEncrypt(PRIMARY_KEY);

      const encrypted = encryptFn(TEST_VALUE, "some-other-key");
      const decrypted = decrypt(encrypted, PRIMARY_KEY);

      expect(decrypted).toBe(TEST_VALUE);
    });
  });

  describe("SDK vs custom Encryptor key derivation", () => {
    it("should produce different encrypted outputs between SDK and custom Encryptor", () => {
      const testData = "test";
      const key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64 hex chars = 32 bytes

      const sdkEncrypted = encrypt(testData, key);
      const customEncryptor = new Encryptor(key);
      const customEncrypted = customEncryptor.encrypt(testData);

      expect(sdkEncrypted).not.toBe(customEncrypted);
    });
  });
});
