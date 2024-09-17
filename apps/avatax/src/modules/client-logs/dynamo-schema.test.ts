import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { EntityParser } from "dynamodb-toolbox";
import { ulid } from "ulid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-schema";

vi.mock("ulid");

const mockDate = new Date("2023-01-01T00:00:00Z");

beforeAll(() => {
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.resetModules();
});

afterAll(() => {
  vi.useRealTimers();
});

vi.stubEnv("DYNAMODB_LOGS_ITEM_TTL_IN_DAYS", "30");

describe("DynamoDB Toolbox Entity Tests", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);
  const tableName = "test-table";

  beforeEach(() => {
    mockDocumentClient.reset();

    vi.mocked(ulid).mockReturnValue("mocked-ulid");
  });

  describe("LogByChannelOrOrderIdEntity", () => {
    it("should create an entity with default fields and calculate SK", async () => {
      const logsTable = LogsTable.create({
        // @ts-expect-error mocking DynamoDBDocumentClient
        documentClient: mockDocumentClient,
        tableName,
      });
      const logs = ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);

      const parseResult = logs.build(EntityParser).parse({
        PK: "test-url#test-app-id",
        level: 3,
        message: "Test message",
        attributes: "{}",
        channelOrOrderId: "12345",
        transactionId: "test-transaction-id",
        channelId: "test-channel",
        date: mockDate.toISOString(),
      });

      expect(parseResult.item).toEqual({
        // generated fields
        SK: "12345#mocked-ulid",
        ulid: "mocked-ulid",
        TTL: LogsTable.getDefaultTTL(),
        _et: "LOG_BY_PSP",
        // unmodified fields
        PK: "test-url#test-app-id",
        level: 3,
        message: "Test message",
        attributes: "{}",
        channelOrOrderId: "12345",
        transactionId: "test-transaction-id",
        channelId: "test-channel",
        date: "2023-01-01T00:00:00.000Z",
      });
    });
  });

  describe("LogByDateEntity", () => {
    it("should create an entity with default fields and calculate SK", async () => {
      // We need to make dynamic import, because we mock ulid
      const { LogsTable, ClientLogDynamoEntityFactory } = await import("./dynamo-schema");
      const logsTable = LogsTable.create({
        // @ts-expect-error mocking DynamoDBDocumentClient
        documentClient: mockDocumentClient,
        tableName,
      });
      const logByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);
      const item = logByDateEntity.build(EntityParser).parse({
        PK: "test-url#test-app-id",
        level: 3,
        message: "Test message",
        attributes: "{}",
        pspReference: "test-psp-reference",
        transactionId: "test-transaction-id",
        channelId: "test-channel",
        date: mockDate.toISOString(),
      });

      expect(item.item).toEqual({
        // generated fields
        SK: "2023-01-01T00:00:00.000Z#mocked-ulid",
        ulid: "mocked-ulid",
        TTL: LogsTable.getDefaultTTL(),
        _et: "LOG_BY_DATE",
        // unmodified fielsd
        PK: "test-url#test-app-id",
        level: 3,
        message: "Test message",
        attributes: "{}",
        pspReference: "test-psp-reference",
        transactionId: "test-transaction-id",
        channelId: "test-channel",
        date: mockDate.toISOString(),
      });
    });
  });
});

describe("LogsTable", () => {
  describe("getDefaultTTL", () => {
    it("should return the correct TTL timestamp for 30 days if used in env", async () => {
      const mockDate = new Date("2023-01-01T00:00:00Z");

      vi.setSystemTime(mockDate);

      const result = LogsTable.getDefaultTTL();

      const expectedDate = new Date("2023-01-31T00:00:00Z");
      const expected = expectedDate.getTime();

      expect(result).toBe(expected);
    });

    it("should return the correct TTL timestamp for 7 days if used in env", async () => {
      const mockDate = new Date("2023-01-01T00:00:00Z");

      vi.setSystemTime(mockDate);

      const result = LogsTable.getDefaultTTL();

      const expectedDate = new Date("2023-01-08T00:00:00Z");
      const expected = expectedDate.getTime();

      expect(result).toBe(expected);
    });
  });
});
