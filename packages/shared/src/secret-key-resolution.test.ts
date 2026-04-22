import { describe, expect, it } from "vitest";

import {
  newSecretKeyServerSchema,
  resolveDecryptFallbacks,
  resolveEncryptKey,
  resolveRotationSourceKeys,
  resolveRotationTargetKey,
} from "./secret-key-resolution";

describe("resolveEncryptKey", () => {
  it("returns SECRET_KEY when NEW_SECRET_KEY is not set", () => {
    expect(resolveEncryptKey({ SECRET_KEY: "current" })).toBe("current");
  });

  it("returns NEW_SECRET_KEY when set", () => {
    expect(resolveEncryptKey({ SECRET_KEY: "current", NEW_SECRET_KEY: "next" })).toBe("next");
  });
});

describe("resolveDecryptFallbacks", () => {
  it("returns empty array when NEW_SECRET_KEY is not set", () => {
    expect(resolveDecryptFallbacks({ SECRET_KEY: "current" })).toStrictEqual([]);
  });

  it("returns [SECRET_KEY] when NEW_SECRET_KEY is set", () => {
    expect(
      resolveDecryptFallbacks({ SECRET_KEY: "current", NEW_SECRET_KEY: "next" }),
    ).toStrictEqual(["current"]);
  });
});

describe("resolveRotationTargetKey", () => {
  it("throws when NEW_SECRET_KEY is not set", () => {
    expect(() => resolveRotationTargetKey({ SECRET_KEY: "current" })).toThrow(/NEW_SECRET_KEY/);
  });

  it("returns NEW_SECRET_KEY when set", () => {
    expect(resolveRotationTargetKey({ SECRET_KEY: "current", NEW_SECRET_KEY: "next" })).toBe(
      "next",
    );
  });
});

describe("resolveRotationSourceKeys", () => {
  it("returns [SECRET_KEY]", () => {
    expect(resolveRotationSourceKeys({ SECRET_KEY: "current" })).toStrictEqual(["current"]);
  });

  it("ignores NEW_SECRET_KEY (not part of source chain)", () => {
    expect(
      resolveRotationSourceKeys({ SECRET_KEY: "current", NEW_SECRET_KEY: "next" }),
    ).toStrictEqual(["current"]);
  });
});

describe("newSecretKeyServerSchema", () => {
  it("parses undefined as undefined for optional field", () => {
    expect(newSecretKeyServerSchema.NEW_SECRET_KEY.parse(undefined)).toBeUndefined();
  });

  it("parses valid string", () => {
    expect(newSecretKeyServerSchema.NEW_SECRET_KEY.parse("abc")).toBe("abc");
  });

  it("throws on empty string due to min(1)", () => {
    expect(() => newSecretKeyServerSchema.NEW_SECRET_KEY.parse("")).toThrow();
  });
});
