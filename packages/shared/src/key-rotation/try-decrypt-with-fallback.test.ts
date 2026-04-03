import { describe, expect, it, vi } from "vitest";

import { tryDecryptWithFallback } from "./try-decrypt-with-fallback";

const PRIMARY = "primary";
const FALLBACK_1 = "fallback-1";
const FALLBACK_2 = "fallback-2";

/**
 * Decrypt succeeds in tests if value is the same as key used for "encryption"
 */
const mockDecrypt = (value: string, key: string): string => {
  if (value === key) return `decrypted-${key}`;
  throw new Error("wrong key");
};

describe("tryDecryptWithFallback", () => {
  it("decrypts with primary key", () => {
    const result = tryDecryptWithFallback({
      value: PRIMARY,
      primaryKey: PRIMARY,
      fallbackKeys: [],
      decryptFn: mockDecrypt,
    });

    expect(result).toBe("decrypted-primary");
  });

  it("decrypts with first fallback when primary fails", () => {
    const result = tryDecryptWithFallback({
      value: FALLBACK_1,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: mockDecrypt,
    });

    expect(result).toBe("decrypted-fallback-1");
  });

  it("decrypts with second fallback when primary and first fail", () => {
    const result = tryDecryptWithFallback({
      value: FALLBACK_2,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1, FALLBACK_2],
      decryptFn: mockDecrypt,
    });

    expect(result).toBe("decrypted-fallback-2");
  });

  it("logs warning when fallback key is used", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    tryDecryptWithFallback({
      value: FALLBACK_1,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: mockDecrypt,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("fallback key at index 0"));
    consoleSpy.mockRestore();
  });

  it("logs correct index for second fallback", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    tryDecryptWithFallback({
      value: FALLBACK_2,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1, FALLBACK_2],
      decryptFn: mockDecrypt,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("fallback key at index 1"));
    consoleSpy.mockRestore();
  });

  it("throws when no key can decrypt", () => {
    expect(() =>
      tryDecryptWithFallback({
        value: "unknown",
        primaryKey: PRIMARY,
        fallbackKeys: [FALLBACK_1],
        decryptFn: mockDecrypt,
      }),
    ).toThrow("[tryDecryptWithFallback] Failed to decrypt with primary key and 1 fallback key(s).");
  });

  it("throws when no fallback keys provided and primary fails", () => {
    expect(() =>
      tryDecryptWithFallback({
        value: "unknown",
        primaryKey: PRIMARY,
        fallbackKeys: [],
        decryptFn: mockDecrypt,
      }),
    ).toThrow("[tryDecryptWithFallback] Failed to decrypt with primary key and 0 fallback key(s).");
  });

  it("does not log warning when primary key succeeds", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    tryDecryptWithFallback({
      value: PRIMARY,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: mockDecrypt,
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
