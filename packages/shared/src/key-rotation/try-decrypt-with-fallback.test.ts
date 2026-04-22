import { describe, expect, it } from "vitest";

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
  it("returns primary status when primary key succeeds", () => {
    const result = tryDecryptWithFallback({
      value: PRIMARY,
      primaryKey: PRIMARY,
      fallbackKeys: [],
      decryptFn: mockDecrypt,
    });

    expect(result).toStrictEqual({ status: "primary", plaintext: "decrypted-primary" });
  });

  it("returns fallback status with index 0 when first fallback succeeds", () => {
    const result = tryDecryptWithFallback({
      value: FALLBACK_1,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: mockDecrypt,
    });

    expect(result).toStrictEqual({
      status: "fallback",
      plaintext: "decrypted-fallback-1",
      fallbackIndex: 0,
    });
  });

  it("returns fallback status with correct index when second fallback succeeds", () => {
    const result = tryDecryptWithFallback({
      value: FALLBACK_2,
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1, FALLBACK_2],
      decryptFn: mockDecrypt,
    });

    expect(result).toStrictEqual({
      status: "fallback",
      plaintext: "decrypted-fallback-2",
      fallbackIndex: 1,
    });
  });

  it("returns failed when no key can decrypt", () => {
    // always throw an error when decrypting, each key will fail
    const failingDecrypt = () => {
      throw new Error("decryption failed");
    };

    const result = tryDecryptWithFallback({
      value: "unknown",
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: failingDecrypt,
    });

    expect(result).toStrictEqual({ status: "failed" });
  });

  it("rejects decrypted value that fails validation", () => {
    // doesn't throw, it just returns a data that should be marked as garbage
    const alwaysDecrypts = (_value: string, _key: string) => "garbage\uFFFDdata";

    const result = tryDecryptWithFallback({
      value: "anything",
      primaryKey: PRIMARY,
      fallbackKeys: [FALLBACK_1],
      decryptFn: alwaysDecrypts,
    });

    expect(result).toStrictEqual({ status: "failed" });
  });

  it("accepts custom validateDecrypted callback", () => {
    // always decrypt as the passed value
    const mockDecrypt = (value: string) => value;

    const params: Parameters<typeof tryDecryptWithFallback>[0] = {
      value: "",
      primaryKey: PRIMARY,
      fallbackKeys: [],
      decryptFn: mockDecrypt,
      validateDecrypted: (text) => {
        try {
          JSON.parse(text);

          return true;
        } catch {
          return false;
        }
      },
    };

    expect(
      tryDecryptWithFallback({
        ...params,
        value: "not-a-json",
      }),
    ).toStrictEqual({ status: "failed" });

    expect(
      tryDecryptWithFallback({
        ...params,
        value: `{"valid": "json"}`,
      }),
    ).toStrictEqual({ status: "primary", plaintext: `{"valid": "json"}` });
  });
});
