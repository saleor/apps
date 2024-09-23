import { describe, expect, it, vi } from "vitest";

import { ClientLog, ClientLogStoreRequest } from "./client-log";
import { LogsTransformer } from "./log-transformer";

describe("LogsTransformer", () => {
  const transformer = new LogsTransformer();

  describe("fromClientLogToDynamoByDateEntityValue", () => {
    it("should transform ClientLogStoreRequest to DynamoDB entity value for logByDateSchema", () => {
      const clientLogRequest = ClientLogStoreRequest.create({
        level: "debug",
        date: "2024-01-01T10:00:00Z",
        message: "Test log",
        attributes: { key: "value" },
        channelId: "channel1",
        checkoutOrOrderId: "checkoutOrOrderId",
        checkoutOrOrder: "checkout",
      })._unsafeUnwrap();

      const saleorApiUrl = "saleorApiUrl";
      const appId = "appId";

      const result = transformer.fromClientLogRequestToDynamoByDateEntityValue({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      const ulid = result.ulid;

      expect(result).toEqual({
        message: "Test log",
        level: 2,
        date: "2024-01-01T10:00:00Z",
        attributes: '{"key":"value"}',
        checkoutOrOrderId: "checkoutOrOrderId",
        checkoutOrOrder: "checkout",
        channelId: "channel1",
        PK: `${saleorApiUrl}#${appId}`,
        SK: `2024-01-01T10:00:00Z#${ulid}`,
        ulid: expect.any(String),
        TTL: expect.any(Number),
      });
    });

    it("should work with optional fields having undefined values", () => {
      const clientLogRequest = ClientLogStoreRequest.create({
        level: "debug",
        date: "2024-01-01T10:00:00Z",
        message: "Test log",
        checkoutOrOrder: "checkout",
      })._unsafeUnwrap();

      const saleorApiUrl = "saleorApiUrl";
      const appId = "appId";

      const result = transformer.fromClientLogRequestToDynamoByDateEntityValue({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      const ulid = result.ulid;

      expect(result).toEqual({
        message: "Test log",
        level: 2,
        checkoutOrOrder: "checkout",
        date: "2024-01-01T10:00:00Z",
        // attribute is filled in as empty object automatically
        attributes: "{}",
        PK: `${saleorApiUrl}#${appId}`,
        SK: `2024-01-01T10:00:00Z#${ulid}`,
        ulid: expect.any(String),
        TTL: expect.any(Number),
      });
    });
  });

  describe("fromClientLogToDynamoByCheckoutOrOrderIdEntityValue", () => {
    it("should transform ClientLogStoreRequest to DynamoDB entity value for orderOrCheckoutIdSchema", () => {
      const clientLogRequest = ClientLogStoreRequest.create({
        level: "error",
        date: "2024-01-01T10:00:00Z",
        message: "Test log",
        attributes: { key: "value" },
        channelId: "channel1",
        checkoutOrOrderId: "checkoutOrOrderId",
        checkoutOrOrder: "checkout",
      })._unsafeUnwrap();

      const saleorApiUrl = "saleorApiUrl";
      const appId = "appId";

      const result = transformer.fromClientLogRequestToDynamoByCheckoutOrOrderIdEntityValue({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      const ulid = result.ulid;

      expect(result).toEqual({
        message: "Test log",
        level: 5,
        date: "2024-01-01T10:00:00Z",
        attributes: '{"key":"value"}',
        checkoutOrOrderId: "checkoutOrOrderId",
        checkoutOrOrder: "checkout",
        channelId: "channel1",
        PK: `${saleorApiUrl}#${appId}`,
        SK: `checkoutOrOrderId#${ulid}`,
        ulid: expect.any(String),
        TTL: expect.any(Number),
      });
    });

    it("should work with optional fields having undefined values", () => {
      const clientLogRequest = ClientLogStoreRequest.create({
        level: "error",
        date: "2024-01-01T10:00:00Z",
        message: "Test log",
        checkoutOrOrderId: "checkoutOrOrderId",
        checkoutOrOrder: "checkout",
      })._unsafeUnwrap();

      const saleorApiUrl = "saleorApiUrl";
      const appId = "appId";

      const result = transformer.fromClientLogRequestToDynamoByCheckoutOrOrderIdEntityValue({
        clientLogRequest,
        saleorApiUrl,
        appId,
      });

      const ulid = result.ulid;

      expect(result).toEqual({
        message: "Test log",
        level: 5,
        date: "2024-01-01T10:00:00Z",
        // attribute is filled in as empty object automatically
        attributes: "{}",
        checkoutOrOrderId: "checkoutOrOrderId",
        PK: `${saleorApiUrl}#${appId}`,
        SK: `checkoutOrOrderId#${ulid}`,
        ulid: expect.any(String),
        checkoutOrOrder: "checkout",
        TTL: expect.any(Number),
      });
    });
  });

  describe("fromDynamoEntityToClientLog", () => {
    it("should transform DynamoDB entity to ClientLog", () => {
      const entity = {
        message: "Test log",
        level: 3,
        date: "2024-01-01T10:00:00Z",
        attributes: '{"key":"value"}',
        checkoutOrOrderId: "checkoutOrOrderId",
        channelId: "channel1",
        PK: "saleorApiUrl#appId",
        SK: "psp1#ulid",
        ulid: "ulid",
        TTL: 123456,
        checkoutOrOrder: "checkout",
      } as const;

      const clientLog = transformer.fromDynamoEntityToClientLog(entity)._unsafeUnwrap();

      expect(clientLog).toBeInstanceOf(ClientLog);

      expect(clientLog.getValue()).toEqual({
        level: "info",
        date: "2024-01-01T10:00:00Z",
        message: "Test log",
        attributes: { key: "value" },
        channelId: "channel1",
        checkoutOrOrderId: "checkoutOrOrderId",
        id: "ulid",
        checkoutOrOrder: "checkout",
      });
    });

    it("should return an error if attributes cannot be parsed", () => {
      const entity = {
        message: "Test log",
        level: 3,
        date: "2024-01-01T10:00:00Z",
        attributes: "invalid json",
        pspReference: "psp1",
        channelId: "channel1",
        PK: "saleorApiUrl#appId",
        SK: "psp1#ulid",
        ulid: "ulid",
        TTL: 123456,
        checkoutOrOrder: "checkout",
      } as const;

      const error = transformer.fromDynamoEntityToClientLog(entity)._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(LogsTransformer.DynamoDBParseError);
    });
  });
});
