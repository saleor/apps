import { describe, expect, it } from "vitest";

import { isEncryptedMetadataKey, matchesAnyEncryptedMetadataKey } from "./metadata-key-matcher";

describe("isEncryptedMetadataKey", () => {
  it("matches domain-scoped metadata key produced by SDK", () => {
    expect(
      isEncryptedMetadataKey("smtp-config__https://demo.saleor.io/graphql/", "smtp-config"),
    ).toBe(true);
  });

  it("matches plain logical key when no domain suffix present", () => {
    expect(isEncryptedMetadataKey("smtp-config", "smtp-config")).toBe(true);
  });

  it("does not match when logical name differs", () => {
    expect(isEncryptedMetadataKey("other-config__https://x/", "smtp-config")).toBe(false);
  });

  it("does not match on partial prefix without separator", () => {
    expect(isEncryptedMetadataKey("smtp-config-v2", "smtp-config")).toBe(false);
  });
});

describe("matchesAnyEncryptedMetadataKey", () => {
  it("returns true if any logical name matches", () => {
    expect(
      matchesAnyEncryptedMetadataKey("smtp-config__https://x/", ["other", "smtp-config"]),
    ).toBe(true);
  });

  it("returns false when no logical name matches", () => {
    expect(matchesAnyEncryptedMetadataKey("unrelated-key", ["smtp-config", "other"])).toBe(false);
  });
});
