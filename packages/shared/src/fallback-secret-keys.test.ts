import { describe, expect, it } from "vitest";

import { collectFallbackSecretKeys, fallbackSecretKeysServerSchema } from "./fallback-secret-keys";

describe("collectFallbackSecretKeys", () => {
  it("returns empty array for empty object", () => {
    const result = collectFallbackSecretKeys({});

    expect(result).toStrictEqual([]);
  });

  it("returns single key when only FALLBACK_SECRET_KEY_1 is set", () => {
    const result = collectFallbackSecretKeys({
      FALLBACK_SECRET_KEY_1: "key1",
    });

    expect(result).toStrictEqual(["key1"]);
  });

  it("skips undefined keys and returns only defined ones", () => {
    const result = collectFallbackSecretKeys({
      FALLBACK_SECRET_KEY_1: "a",
      FALLBACK_SECRET_KEY_3: "c",
    });

    expect(result).toStrictEqual(["a", "c"]);
  });

  it("returns all three keys when all are set", () => {
    const result = collectFallbackSecretKeys({
      FALLBACK_SECRET_KEY_1: "k1",
      FALLBACK_SECRET_KEY_2: "k2",
      FALLBACK_SECRET_KEY_3: "k3",
    });

    expect(result).toStrictEqual(["k1", "k2", "k3"]);
  });

  it("returns only second key when only FALLBACK_SECRET_KEY_2 is set", () => {
    const result = collectFallbackSecretKeys({
      FALLBACK_SECRET_KEY_2: "only-second",
    });

    expect(result).toStrictEqual(["only-second"]);
  });
});

describe("fallbackSecretKeysServerSchema", () => {
  it("parses undefined as undefined for optional field", () => {
    const result = fallbackSecretKeysServerSchema.FALLBACK_SECRET_KEY_1.parse(undefined);

    expect(result).toBeUndefined();
  });

  it("parses valid string", () => {
    const result = fallbackSecretKeysServerSchema.FALLBACK_SECRET_KEY_1.parse("abc");

    expect(result).toBe("abc");
  });

  it("throws on empty string due to min(1)", () => {
    expect(() => {
      fallbackSecretKeysServerSchema.FALLBACK_SECRET_KEY_1.parse("");
    }).toThrow();
  });
});
