import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";

import { createRotatingDecryptCallback } from "./rotating-decrypt-callback";

const PRIMARY_KEY = "primary-key-for-testing";
const FALLBACK_KEY_1 = "fallback-key-one";
const FALLBACK_KEY_2 = "fallback-key-two";
const TEST_VALUE = "secret-data";

describe("createRotatingDecryptCallback", () => {
  it("decrypts with primary key when no fallback keys provided", () => {
    const encrypted = encrypt(TEST_VALUE, PRIMARY_KEY);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, []);

    const result = callback(encrypted, "ignored-secret");

    expect(result).toBe(TEST_VALUE);
  });

  it("decrypts with fallback key when primary key fails", () => {
    const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_1);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, [FALLBACK_KEY_1]);

    const result = callback(encrypted, "ignored-secret");

    expect(result).toBe(TEST_VALUE);
  });

  it("logs warning when using fallback key", () => {
    const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_1);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, [FALLBACK_KEY_1]);
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    callback(encrypted, "ignored-secret");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[createRotatingDecryptCallback] Decrypted using fallback key at index 0",
      ),
    );
    consoleSpy.mockRestore();
  });

  it("throws error when no key can decrypt the value", () => {
    const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_1);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, [FALLBACK_KEY_2]);

    expect(() => callback(encrypted, "ignored-secret")).toThrow(
      "[createRotatingDecryptCallback] Failed to decrypt with primary key and 1 fallback key(s).",
    );
  });

  it("ignores the secret parameter and uses keys from closure", () => {
    const encrypted = encrypt(TEST_VALUE, PRIMARY_KEY);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, []);

    const result = callback(encrypted, "wrong-secret-value");

    expect(result).toBe(TEST_VALUE);
  });

  it("tries fallback keys in order", () => {
    const encrypted = encrypt(TEST_VALUE, FALLBACK_KEY_2);
    const callback = createRotatingDecryptCallback(PRIMARY_KEY, [FALLBACK_KEY_1, FALLBACK_KEY_2]);
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = callback(encrypted, "ignored-secret");

    expect(result).toBe(TEST_VALUE);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("fallback key at index 1"));
    consoleSpy.mockRestore();
  });
});
