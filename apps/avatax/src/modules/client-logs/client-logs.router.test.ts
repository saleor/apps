import { describe, expect, it } from "vitest";

import { getByDateInputSchema, isDynamoValidationError } from "./client-logs.router";

describe("isDynamoValidationError", () => {
  it("returns true when cause is a ValidationException", () => {
    const dynamoError = new Error(
      "The provided starting key does not match the range key predicate",
    );

    dynamoError.name = "ValidationException";

    const wrappedError = new Error("Error while fetching logs from DynamoDB by date", {
      cause: dynamoError,
    });

    expect(isDynamoValidationError(wrappedError)).toBe(true);
  });

  it("returns false when cause is a different error type", () => {
    const dynamoError = new Error("Service unavailable");

    dynamoError.name = "ServiceUnavailable";

    const wrappedError = new Error("Error while fetching logs", {
      cause: dynamoError,
    });

    expect(isDynamoValidationError(wrappedError)).toBe(false);
  });

  it("returns false when error has no cause", () => {
    const error = new Error("Some error");

    expect(isDynamoValidationError(error)).toBe(false);
  });

  it("returns false when error is not an Error instance", () => {
    expect(isDynamoValidationError("string error")).toBe(false);
    expect(isDynamoValidationError(null)).toBe(false);
    expect(isDynamoValidationError(undefined)).toBe(false);
  });

  it("returns false when cause is not an Error instance", () => {
    const error = new Error("Some error", { cause: "not an error" });

    expect(isDynamoValidationError(error)).toBe(false);
  });
});

describe("getByDateInputSchema", () => {
  it("accepts a range where startDate is before endDate", () => {
    const result = getByDateInputSchema.safeParse({
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-02T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a range where startDate equals endDate", () => {
    const result = getByDateInputSchema.safeParse({
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-01T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an inverted range where startDate is after endDate", () => {
    const result = getByDateInputSchema.safeParse({
      startDate: "2026-01-02T00:00:00.000Z",
      endDate: "2026-01-01T00:00:00.000Z",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe("startDate must be before or equal to endDate");
    }
  });
});
