import { describe, expect, test, vi } from "vitest";

import {
  ClientLog,
  ClientLogStoreRequest,
  ClientLogStoreRequestValue,
  ClientLogValue,
} from "./client-log";

vi.stubEnv("DYNAMODB_LOGS_ITEM_TTL_IN_DAYS", "30");

describe("ClientLog", () => {
  test("create returns new instance when used valid input", () => {
    const logData: ClientLogValue = {
      message: "Test message",
      level: "info",
      date: new Date().toISOString(),
      attributes: {},
      id: "12345",
      checkoutOrOrderId: "aabbcc",
    };

    const result = ClientLog.create(logData);

    const log = result._unsafeUnwrap();

    expect(log).toBeInstanceOf(ClientLog);

    expect(log.getValue()).toEqual(logData);
  });

  test("create fails with invalid input", () => {
    const logData: ClientLogValue = {
      message: "Test message",
      // @ts-expect-error Testing invalid input
      level: "invalid_level",
      date: new Date().toISOString(),
      attributes: {},
      id: "12345",
    };

    const result = ClientLog.create(logData);

    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(ClientLog.InputParseError);
  });
});

describe("ClientLogStoreRequest", () => {
  test("create returns new instance when used valid input", () => {
    const logData: ClientLogStoreRequestValue = {
      message: "Test message",
      level: "info",
      date: new Date().toISOString(),
      attributes: {},
      checkoutOrOrderId: "aabbcc",
    };
    const result = ClientLogStoreRequest.create(logData);
    const log = result._unsafeUnwrap();

    expect(log).toBeInstanceOf(ClientLogStoreRequest);

    expect(log.getValue()).toEqual(logData);
  });

  test("create fails with invalid input", () => {
    const logData: ClientLogStoreRequestValue = {
      message: "Test message",
      // @ts-expect-error Testing invalid input
      level: "invalid_level",
      date: new Date().toISOString(),
      attributes: {},
      checkoutOrOrderId: "aabbcc",
    } as const;

    const result = ClientLogStoreRequest.create(logData);
    const error = result._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(ClientLogStoreRequest.InputParseError);
  });
});