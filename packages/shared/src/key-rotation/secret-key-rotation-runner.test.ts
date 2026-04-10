import { describe, expect, it, vi } from "vitest";

import { type RotationItem, SecretKeyRotationRunner } from "./secret-key-rotation-runner";

const PRIMARY_KEY = "primary";
const FALLBACK_1 = "fallback-1";
const FALLBACK_2 = "fallback-2";

/**
 * Toy encryption: encrypt("plaintext", "key") => "key:plaintext"
 * Toy decryption: decrypt("key:plaintext", "key") => "plaintext", throws otherwise
 */
const toyEncrypt = (plaintext: string, key: string): string => `${key}:${plaintext}`;

const toyDecrypt = (encrypted: string, key: string): string => {
  const [encKey, ...rest] = encrypted.split(":");

  if (encKey !== key) throw new Error("wrong key");

  return rest.join(":");
};

const createLogger = () => ({
  info: vi.fn(),
  error: vi.fn(),
});

async function* fromArray<T>(items: T[]): AsyncGenerator<T> {
  yield* items;
}

const createRunner = <T>(
  overrides: Partial<ConstructorParameters<typeof SecretKeyRotationRunner<T>>[0]> & {
    getItems: () => AsyncIterable<RotationItem<T>>;
  },
) => {
  const logger = createLogger();

  const runner = new SecretKeyRotationRunner<T>({
    secretKey: PRIMARY_KEY,
    fallbackKeys: [FALLBACK_1, FALLBACK_2],
    dryRun: false,
    logger,
    decrypt: toyDecrypt,
    encrypt: toyEncrypt,
    saveItem: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  return { runner, logger, saveItem: overrides.saveItem ?? runner["config"].saveItem };
};

describe("SecretKeyRotationRunner", () => {
  it("rotates fields encrypted with a fallback key", async () => {
    const saveItem = vi.fn().mockResolvedValue(undefined);

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "item-1",
            encryptedFields: [
              { name: "secret", encryptedValue: toyEncrypt("my-value", FALLBACK_1) },
            ],
            original: { some: "data" },
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 0, failed: 0 });
    expect(saveItem).toHaveBeenCalledWith({
      id: "item-1",
      reEncryptedFields: { secret: toyEncrypt("my-value", PRIMARY_KEY) },
      original: { some: "data" },
    });
  });

  it("skips fields already encrypted with the primary key", async () => {
    const saveItem = vi.fn();

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "item-1",
            encryptedFields: [
              { name: "secret", encryptedValue: toyEncrypt("my-value", PRIMARY_KEY) },
            ],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 0, skipped: 1, failed: 0 });
    expect(saveItem).not.toHaveBeenCalled();
  });

  it("handles mixed items — some need rotation, some do not", async () => {
    const saveItem = vi.fn().mockResolvedValue(undefined);

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "already-current",
            encryptedFields: [{ name: "a", encryptedValue: toyEncrypt("val-a", PRIMARY_KEY) }],
            original: {},
          },
          {
            id: "needs-rotation",
            encryptedFields: [{ name: "b", encryptedValue: toyEncrypt("val-b", FALLBACK_1) }],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 1, failed: 0 });
    expect(saveItem).toHaveBeenCalledTimes(1);
    expect(saveItem).toHaveBeenCalledWith(expect.objectContaining({ id: "needs-rotation" }));
  });

  it("counts undecryptable fields as failed and continues processing", async () => {
    const saveItem = vi.fn().mockResolvedValue(undefined);

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "item-bad",
            encryptedFields: [{ name: "broken", encryptedValue: "unknown-key:data" }],
            original: {},
          },
          {
            id: "item-good",
            encryptedFields: [{ name: "ok", encryptedValue: toyEncrypt("val", FALLBACK_1) }],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 0, failed: 1 });
    expect(saveItem).toHaveBeenCalledTimes(1);
    expect(saveItem).toHaveBeenCalledWith(expect.objectContaining({ id: "item-good" }));
  });

  it("does not call saveItem in dry run mode", async () => {
    const saveItem = vi.fn();

    const { runner } = createRunner({
      dryRun: true,
      getItems: () =>
        fromArray([
          {
            id: "item-1",
            encryptedFields: [{ name: "s", encryptedValue: toyEncrypt("val", FALLBACK_1) }],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 0, failed: 0 });
    expect(saveItem).not.toHaveBeenCalled();
  });

  it("throws when no fallback keys are configured", async () => {
    const { runner } = createRunner({
      fallbackKeys: [],
      getItems: () => fromArray([]),
    });

    await expect(runner.run()).rejects.toThrow("No fallback keys configured");
  });

  it("handles multi-field items with partial rotation", async () => {
    const saveItem = vi.fn().mockResolvedValue(undefined);

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "multi-field",
            encryptedFields: [
              { name: "already-ok", encryptedValue: toyEncrypt("v1", PRIMARY_KEY) },
              { name: "needs-rotate", encryptedValue: toyEncrypt("v2", FALLBACK_2) },
            ],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 1, failed: 0 });
    expect(saveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        reEncryptedFields: { "needs-rotate": toyEncrypt("v2", PRIMARY_KEY) },
      }),
    );
  });

  it("counts all fields as failed when saveItem throws", async () => {
    const saveItem = vi.fn().mockRejectedValue(new Error("save failed"));

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "item-1",
            encryptedFields: [
              { name: "a", encryptedValue: toyEncrypt("v1", FALLBACK_1) },
              { name: "b", encryptedValue: toyEncrypt("v2", FALLBACK_1) },
            ],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 0, skipped: 0, failed: 2 });
  });

  it("returns zeros for empty items list", async () => {
    const { runner } = createRunner({
      getItems: () => fromArray([]),
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 0, skipped: 0, failed: 0 });
  });

  it("limits concurrency to the configured batch size", async () => {
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const saveItem = vi.fn().mockImplementation(async () => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      await new Promise((resolve) => setTimeout(resolve, 10));
      currentConcurrent--;
    });

    const items = Array.from({ length: 7 }, (_, i) => ({
      id: `item-${i}`,
      encryptedFields: [{ name: "s", encryptedValue: toyEncrypt(`val-${i}`, FALLBACK_1) }],
      original: {},
    }));

    const { runner } = createRunner({
      concurrency: 3,
      getItems: () => fromArray(items),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 7, skipped: 0, failed: 0 });
    expect(saveItem).toHaveBeenCalledTimes(7);
    expect(maxConcurrent).toBeLessThanOrEqual(3);
    expect(maxConcurrent).toBeGreaterThan(1);
  });

  it("uses second fallback key when first fails", async () => {
    const saveItem = vi.fn().mockResolvedValue(undefined);

    const { runner } = createRunner({
      getItems: () =>
        fromArray([
          {
            id: "item-1",
            encryptedFields: [
              { name: "secret", encryptedValue: toyEncrypt("my-value", FALLBACK_2) },
            ],
            original: {},
          },
        ]),
      saveItem,
    });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 1, skipped: 0, failed: 0 });
    expect(saveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        reEncryptedFields: { secret: toyEncrypt("my-value", PRIMARY_KEY) },
      }),
    );
  });
});
