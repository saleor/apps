import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDynamoDBSecretKeyRotationRunner } from "./dynamodb-secret-key-rotation-runner";

const PRIMARY_KEY = "primary";
const FALLBACK_KEY = "fallback";
const TABLE = "test-table";

const mockEncrypt = (plaintext: string, key: string): string => `${key}:${plaintext}`;

const mockDecrypt = (encrypted: string, key: string): string => {
  const [encKey, ...rest] = encrypted.split(":");

  if (encKey !== key) throw new Error("wrong key");

  return rest.join(":");
};

const createLogger = () => ({
  info: vi.fn(),
  error: vi.fn(),
});

class FakeConditionalCheckFailed extends Error {
  readonly name = "ConditionalCheckFailedException";
}

describe("createDynamoDBSecretKeyRotationRunner", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    mockDocumentClient.reset();
  });

  const buildRunner = (overrides?: { dryRun?: boolean; encryptedFieldNames?: string[] }) => {
    const logger = createLogger();
    const runner = createDynamoDBSecretKeyRotationRunner({
      secretKey: PRIMARY_KEY,
      fallbackKeys: [FALLBACK_KEY],
      dryRun: overrides?.dryRun ?? false,
      logger,
      // @ts-expect-error mocking DynamoDBDocumentClient
      documentClient: mockDocumentClient,
      tableName: TABLE,
      encryptedFieldNames: overrides?.encryptedFieldNames ?? ["secretA", "secretB"],
      decrypt: mockDecrypt,
      encrypt: mockEncrypt,
    });

    return { runner, logger };
  };

  it("scans with ConsistentRead and ProjectionExpression covering PK/SK + encrypted fields", async () => {
    mockDocumentClient.on(ScanCommand).resolves({ Items: [], $metadata: {} });

    const { runner } = buildRunner({ encryptedFieldNames: ["secretA", "secretB"] });

    await runner.run();

    const calls = mockDocumentClient.commandCalls(ScanCommand);

    expect(calls).toHaveLength(1);
    expect(calls[0].args[0].input).toMatchObject({
      TableName: TABLE,
      ConsistentRead: true,
      ProjectionExpression: "#pk, #sk, #f0, #f1",
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#sk": "SK",
        "#f0": "secretA",
        "#f1": "secretB",
      },
    });
  });

  it("paginates using LastEvaluatedKey until exhausted", async () => {
    const page1Last = { PK: "x", SK: "y" };

    mockDocumentClient
      .on(ScanCommand)
      .resolvesOnce({ Items: [], LastEvaluatedKey: page1Last, $metadata: {} })
      .resolvesOnce({ Items: [], $metadata: {} });

    const { runner } = buildRunner();

    await runner.run();

    const calls = mockDocumentClient.commandCalls(ScanCommand);

    expect(calls).toHaveLength(2);
    expect(calls[0].args[0].input.ExclusiveStartKey).toBeUndefined();
    expect(calls[1].args[0].input.ExclusiveStartKey).toStrictEqual(page1Last);
  });

  it("rotates fields with a conditional UpdateCommand", async () => {
    const oldCipher = mockEncrypt("plain", FALLBACK_KEY);

    mockDocumentClient.on(ScanCommand).resolves({
      Items: [{ PK: "p1", SK: "s1", secretA: oldCipher, secretB: oldCipher }],
      $metadata: {},
    });
    mockDocumentClient.on(UpdateCommand).resolves({ $metadata: {} });

    const { runner } = buildRunner();

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 2, skipped: 0, failed: 0, concurrentlyModified: 0 });

    const calls = mockDocumentClient.commandCalls(UpdateCommand);

    expect(calls).toHaveLength(1);
    expect(calls[0].args[0].input).toMatchObject({
      TableName: TABLE,
      Key: { PK: "p1", SK: "s1" },
      UpdateExpression: "SET #f0 = :new0, #f1 = :new1",
      ConditionExpression: "#f0 = :old0 AND #f1 = :old1",
      ExpressionAttributeNames: { "#f0": "secretA", "#f1": "secretB" },
      ExpressionAttributeValues: {
        ":new0": mockEncrypt("plain", PRIMARY_KEY),
        ":old0": oldCipher,
        ":new1": mockEncrypt("plain", PRIMARY_KEY),
        ":old1": oldCipher,
      },
    });
  });

  it("treats ConditionalCheckFailedException as concurrently modified", async () => {
    const oldCipher = mockEncrypt("plain", FALLBACK_KEY);

    mockDocumentClient.on(ScanCommand).resolves({
      Items: [{ PK: "p1", SK: "s1", secretA: oldCipher, secretB: oldCipher }],
      $metadata: {},
    });
    mockDocumentClient.on(UpdateCommand).rejects(new FakeConditionalCheckFailed("stale"));

    const { runner, logger } = buildRunner();

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 0, skipped: 0, failed: 0, concurrentlyModified: 2 });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("rethrows non-ConditionalCheckFailed errors so the runner counts them as failed", async () => {
    const oldCipher = mockEncrypt("plain", FALLBACK_KEY);

    mockDocumentClient.on(ScanCommand).resolves({
      Items: [{ PK: "p1", SK: "s1", secretA: oldCipher, secretB: oldCipher }],
      $metadata: {},
    });
    mockDocumentClient.on(UpdateCommand).rejects(new Error("network boom"));

    const { runner } = buildRunner();

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 0, skipped: 0, failed: 2, concurrentlyModified: 0 });
  });

  it("skips items missing any encrypted field", async () => {
    mockDocumentClient.on(ScanCommand).resolves({
      Items: [
        { PK: "p1", SK: "s1", secretA: mockEncrypt("v", FALLBACK_KEY) },
        {
          PK: "p2",
          SK: "s2",
          secretA: mockEncrypt("v", FALLBACK_KEY),
          secretB: mockEncrypt("v", FALLBACK_KEY),
        },
      ],
      $metadata: {},
    });
    mockDocumentClient.on(UpdateCommand).resolves({ $metadata: {} });

    const { runner } = buildRunner();

    const result = await runner.run();

    expect(result.rotated).toBe(2);
    expect(mockDocumentClient.commandCalls(UpdateCommand)).toHaveLength(1);
  });

  it("does not send UpdateCommand in dry-run mode", async () => {
    const oldCipher = mockEncrypt("plain", FALLBACK_KEY);

    mockDocumentClient.on(ScanCommand).resolves({
      Items: [{ PK: "p1", SK: "s1", secretA: oldCipher, secretB: oldCipher }],
      $metadata: {},
    });

    const { runner } = buildRunner({ dryRun: true });

    const result = await runner.run();

    expect(result).toStrictEqual({ rotated: 2, skipped: 0, failed: 0, concurrentlyModified: 0 });
    expect(mockDocumentClient.commandCalls(UpdateCommand)).toHaveLength(0);
  });

  it("logs each scan page with its LastEvaluatedKey", async () => {
    mockDocumentClient
      .on(ScanCommand)
      .resolvesOnce({ Items: [], LastEvaluatedKey: { PK: "x", SK: "y" }, $metadata: {} })
      .resolvesOnce({ Items: [], $metadata: {} });

    const { runner, logger } = buildRunner();

    await runner.run();

    const messages = logger.info.mock.calls.map((c) => c[0] as string);

    expect(messages.some((m) => m.includes("Scanned page 1") && m.includes('"PK":"x"'))).toBe(true);
    expect(messages.some((m) => m.includes("Scanned page 2") && m.includes("scan complete"))).toBe(
      true,
    );
  });
});
