import { describe, expect, it, vi } from "vitest";

import { Encryptor } from "../encryptor";
import { DecryptionError, RotatingEncryptor } from "./rotating-encryptor";

const logger = { warn: vi.fn(), error: vi.fn() } as unknown as ConstructorParameters<
  typeof RotatingEncryptor
>[0]["logger"];

describe("RotatingEncryptor", () => {
  it("Throws DecryptionError when no configured key decrypts the value", () => {
    const encrypted = new Encryptor("a".repeat(64)).encrypt("rk_live_123");
    const encryptor = new RotatingEncryptor({
      primarySecret: "b".repeat(64),
      fallbackSecrets: ["c".repeat(64)],
      logger,
    });

    expect(() => encryptor.decrypt(encrypted)).toThrow(DecryptionError);
  });
});
