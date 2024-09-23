import { BatchWriteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { type SavedItem } from "dynamodb-toolbox";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientLog, ClientLogStoreRequest } from "@/modules/client-logs/client-log";

import { ClientLogDynamoEntityFactory, LogsTable } from "./dynamo-schema";
import { LogsRepositoryDynamodb, LogsRepositoryMemory } from "./logs-repository";

const saleorApiUrl = "https://test.com/graphql/";
const appId = "123456";

describe("LogsRepositoryDynamodb", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);
  const tableName = "test-table";

  const logsTable = LogsTable.create({
    // @ts-expect-error mocking DynamoDBDocumentClient
    documentClient: mockDocumentClient,
    tableName,
  });
  const logByCheckoutOrOrderId =
    ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);
  const logByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);

  beforeEach(() => {
    mockDocumentClient.reset();
  });

  describe("writeLog", () => {
    it("should write log successfully", async () => {
      mockDocumentClient.on(BatchWriteCommand, {}).resolvesOnce({});
      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const clientLogResult = ClientLogStoreRequest.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        checkoutOrOrder: "checkout",
      });

      const clientLogRequest = clientLogResult._unsafeUnwrap();
      const date = clientLogRequest.getValue().date;

      const result = await logsRepositoryDynamodb.writeLog({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toBeUndefined();

      const args =
        mockDocumentClient.commandCalls(BatchWriteCommand)[0].args[0].input.RequestItems![
          tableName
        ];

      expect(args[0].PutRequest!.Item).toStrictEqual(
        expect.objectContaining({
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: expect.stringMatching(/^test-order-id#/),
          ulid: expect.any(String),
          level: 3,
          attributes: '{"test":"attribute"}',
          message: "Test message",
          TTL: expect.any(Number),
          checkoutOrOrder: "checkout",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel-id",
          date: expect.any(String),
          _et: "LOG_BY_CHECKOUT_OR_ORDER_ID",
        }),
      );

      expect(args[1].PutRequest!.Item).toStrictEqual(
        expect.objectContaining({
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          ulid: expect.any(String),
          level: 3,
          attributes: '{"test":"attribute"}',
          message: "Test message",
          TTL: expect.any(Number),
          checkoutOrOrder: "checkout",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel-id",
          date: expect.any(String),
          SK: expect.stringMatching(new RegExp(`^${date}#`)),
          _et: "LOG_BY_DATE",
        }),
      );
    });

    it("should handle errors from DynamoDB when writing log", async () => {
      mockDocumentClient.on(BatchWriteCommand, {}).rejectsOnce("Throttled");
      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const clientLogResult = ClientLogStoreRequest.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        checkoutOrOrder: "checkout",
      });

      const clientLogRequest = clientLogResult._unsafeUnwrap();

      const result = await logsRepositoryDynamodb.writeLog({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.WriteLogError);
    });

    it("should return error when some items weren't processed", async () => {
      mockDocumentClient
        .on(BatchWriteCommand, {})
        .resolvesOnce({ UnprocessedItems: { [tableName]: [{ PutRequest: { Item: {} } }] } });
      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const clientLogResult = ClientLogStoreRequest.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        checkoutOrOrder: "checkout",
      });

      const clientLogRequest = clientLogResult._unsafeUnwrap();

      const result = await logsRepositoryDynamodb.writeLog({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        LogsRepositoryDynamodb.UnprocessedItemsError,
      );
    });
  });

  describe("getLogsByDate", () => {
    it("should return logs when items are found in the database", async () => {
      const mockItems: SavedItem<typeof logByDateEntity>[] = [
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "2023-01-01T00:00:01Z#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          attributes: "{}",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel",
          _et: "LOG_BY_DATE",
          checkoutOrOrder: "checkout",
        },
      ];

      mockDocumentClient.on(QueryCommand).resolvesOnce({
        Items: mockItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByDate({
        saleorApiUrl,
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-02T00:00:00Z"),
        appId,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toHaveLength(1);

      expect(result._unsafeUnwrap()[0]).toBeInstanceOf(ClientLog);
    });

    it("should return an empty array when no items are found in the database", async () => {
      mockDocumentClient.on(QueryCommand).resolves({
        Items: [],
        Count: 0,
        ScannedCount: 0,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByDate({
        saleorApiUrl,
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-02T00:00:00Z"),
        appId,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toEqual([]);
    });

    it("should return an error when data cannot be mapped to ClientLog", async () => {
      const invalidItems: SavedItem<typeof logByDateEntity>[] = [
        // This log is valid
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "2023-01-01T00:00:01Z#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          attributes: "{}",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel",
          _et: "LOG_BY_DATE",
          checkoutOrOrder: "checkout",
        },
        // This log is invalid
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "2023-01-01T00:00:01Z#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          // Invalid JSON:
          attributes: "abcd",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel",
          _et: "LOG_BY_DATE",
          checkoutOrOrder: "checkout",
        },
      ];

      mockDocumentClient.on(QueryCommand).resolves({
        Items: invalidItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByDate({
        saleorApiUrl,
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-02T00:00:00Z"),
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.DataMappingError);
    });

    it("should return an error when returned data from Database is invalid", async () => {
      const invalidItems: Partial<SavedItem<typeof logByDateEntity>>[] = [
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "2023-01-01T00:00:00Z#123",
          _et: "LOG_BY_DATE",
          // Missing required fields
        },
      ];

      mockDocumentClient.on(QueryCommand).resolves({
        Items: invalidItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByDate({
        saleorApiUrl,
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-02T00:00:00Z"),
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.LogsFetchError);
    });

    it("should return an error when fetching data from Database fails", async () => {
      mockDocumentClient.on(QueryCommand).rejects(new Error("Database error"));

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByDate({
        saleorApiUrl,
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-02T00:00:00Z"),
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.LogsFetchError);
    });
  });

  describe("getLogsByCheckoutOrOrderId", () => {
    it("should return logs when items are found in the database", async () => {
      const mockItems: SavedItem<typeof logByCheckoutOrOrderId>[] = [
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "test-psp#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          attributes: "{}",
          checkoutOrOrderId: "test-order-id",
          channelId: "test-channel",
          _et: "LOG_BY_CHECKOUT_OR_ORDER_ID",
          checkoutOrOrder: "checkout",
        },
      ];

      mockDocumentClient.on(QueryCommand).resolvesOnce({
        Items: mockItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        checkoutOrOrderId: "test-order-id",
        appId,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toHaveLength(1);

      expect(result._unsafeUnwrap()[0]).toBeInstanceOf(ClientLog);
    });

    it("should return an empty array when no items are found in the database", async () => {
      mockDocumentClient.on(QueryCommand).resolves({
        Items: [],
        Count: 0,
        ScannedCount: 0,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        checkoutOrOrderId: "test-order-id",
        appId,
      });

      expect(result.isOk()).toBe(true);

      expect(result._unsafeUnwrap()).toEqual([]);
    });

    it("should return an error when data cannot be mapped to ClientLog", async () => {
      const invalidItems: SavedItem<typeof logByCheckoutOrOrderId>[] = [
        // This log is valid
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "test-psp#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          attributes: "{}",
          checkoutOrOrderId: "test-order-id",
          transactionId: "test-transaction",
          channelId: "test-channel",
          _et: "LOG_BY_CHECKOUT_OR_ORDER_ID",
          checkoutOrOrder: "checkout",
        },
        // This log is invalid
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "test-psp#123",
          ulid: "123",
          level: 3,
          message: "Test message",
          TTL: 1727180717707,
          date: "2023-01-01T00:00:00Z",
          // Invalid JSON:
          attributes: "abcd",
          checkoutOrOrderId: "test-order-id",
          transactionId: "test-transaction",
          channelId: "test-channel",
          _et: "LOG_BY_CHECKOUT_OR_ORDER_ID",
          checkoutOrOrder: "checkout",
        },
      ];

      mockDocumentClient.on(QueryCommand).resolves({
        Items: invalidItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        checkoutOrOrderId: "test-order-id",
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.DataMappingError);
    });

    it("should return an error when returned data from Database is invalid", async () => {
      const invalidItems: Partial<SavedItem<typeof logByCheckoutOrOrderId>>[] = [
        {
          PK: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          SK: "test-psp#123",
          _et: "LOG_BY_CHECKOUT_OR_ORDER_ID",
          // Missing required fields
        },
      ];

      mockDocumentClient.on(QueryCommand).resolves({
        Items: invalidItems,
        Count: 1,
        ScannedCount: 1,
      });

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        checkoutOrOrderId: "test-order-id",
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.LogsFetchError);
    });

    it("should return an error when fetching data from Database fails", async () => {
      mockDocumentClient.on(QueryCommand).rejects(new Error("Database error"));

      const logsRepositoryDynamodb = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId: logByCheckoutOrOrderId,
        logByDateEntity,
      });

      const result = await logsRepositoryDynamodb.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        checkoutOrOrderId: "test-order-id",
        appId,
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(LogsRepositoryDynamodb.LogsFetchError);
    });
  });
});

describe("LogsRepositoryMemory", () => {
  describe("getLogsByDate", () => {
    it("should return all logs", async () => {
      const logsRepositoryMemory = new LogsRepositoryMemory();
      const testLogResult = ClientLog.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        checkoutOrOrder: "checkout",
        id: "test-id",
      });

      const testLog = testLogResult._unsafeUnwrap();

      logsRepositoryMemory.logs = [testLog];

      const result = await logsRepositoryMemory.getLogsByDate({
        saleorApiUrl,
        startDate: new Date(),
        // endDate = startDate + 1h
        endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
        appId,
      });

      expect(result._unsafeUnwrap()).toEqual([testLog]);
    });
  });

  describe("writeLog", () => {
    it("should add a log to the logs array", async () => {
      const logsRepositoryMemory = new LogsRepositoryMemory();
      const testLogResult = ClientLogStoreRequest.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        checkoutOrOrder: "checkout",
      });

      const testLog = testLogResult._unsafeUnwrap();

      await logsRepositoryMemory.writeLog({ clientLogRequest: testLog });

      expect(logsRepositoryMemory.logs[0].getValue()).toStrictEqual(
        expect.objectContaining(testLog.getValue()),
      );
    });
  });

  describe("getLogsByPspReference", () => {
    it("should return all logs", async () => {
      const logsRepositoryMemory = new LogsRepositoryMemory();
      const testLogResult = ClientLog.create({
        message: "Test message",
        level: "info",
        date: new Date().toISOString(),
        attributes: { test: "attribute" },
        checkoutOrOrderId: "test-order-id",
        channelId: "test-channel-id",
        id: "test-id",
        checkoutOrOrder: "checkout",
      });

      const testLog = testLogResult._unsafeUnwrap();

      logsRepositoryMemory.logs = [testLog];

      const result = await logsRepositoryMemory.getLogsByCheckoutOrOrderId({
        saleorApiUrl,
        appId,
        checkoutOrOrderId: "test-order-id",
      });

      expect(result._unsafeUnwrap()).toEqual([testLog]);
    });
  });
});
