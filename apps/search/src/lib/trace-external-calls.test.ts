import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { traceExternalCall } from "./trace-external-calls";

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("./logger", () => ({
  createLogger: () => mockLogger,
}));

describe("trace-external-calls", () => {
  describe("traceExternalCall", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the result of the operation", async () => {
      const expectedResult = { data: "test" };
      const operation = vi.fn().mockResolvedValue(expectedResult);

      const result = await traceExternalCall(operation, { name: "Test operation" });

      expect(result).toStrictEqual(expectedResult);
      expect(operation).toHaveBeenCalledOnce();
    });

    it("throws when operation fails", async () => {
      const error = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(traceExternalCall(operation, { name: "Test operation" })).rejects.toThrow(
        "Operation failed",
      );
    });

    it("logs debug on start and finish for fast operations", async () => {
      const operation = vi.fn().mockResolvedValue("result");

      await traceExternalCall(operation, {
        name: "Test operation",
        attributes: { foo: "bar" },
      });

      expect(mockLogger.debug).toHaveBeenCalledWith("Starting: Test operation", { foo: "bar" });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Test operation",
        expect.objectContaining({ foo: "bar", durationMs: expect.any(Number) }),
      );
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it("logs warning when operation exceeds slowThresholdMs", async () => {
      const operation = vi.fn().mockImplementation(async () => {
        // Advance time by 150ms (exceeds 100ms threshold)
        vi.advanceTimersByTime(150);

        return "result";
      });

      await traceExternalCall(operation, {
        name: "Slow operation",
        slowThresholdMs: 100,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Slow external call: Slow operation",
        expect.objectContaining({
          durationMs: expect.any(Number),
          slowThresholdMs: 100,
        }),
      );
      expect(mockLogger.debug).toHaveBeenCalledTimes(1); // Only "Starting" debug, no "Finished" debug
    });

    it("logs debug (not warning) when operation is faster than threshold", async () => {
      const operation = vi.fn().mockImplementation(async () => {
        // Advance time by 50ms (under 100ms threshold)
        vi.advanceTimersByTime(50);

        return "result";
      });

      await traceExternalCall(operation, {
        name: "Fast operation",
        slowThresholdMs: 100,
      });

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Fast operation",
        expect.objectContaining({ durationMs: expect.any(Number) }),
      );
    });

    it("logs error when operation fails", async () => {
      const error = new Error("Something went wrong");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(traceExternalCall(operation, { name: "Failing operation" })).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "External call failed: Failing operation",
        expect.objectContaining({
          durationMs: expect.any(Number),
          error: "Something went wrong",
        }),
      );
    });

    it("logs error with string representation for non-Error objects", async () => {
      const operation = vi.fn().mockRejectedValue("string error");

      await expect(traceExternalCall(operation, { name: "Failing operation" })).rejects.toBe(
        "string error",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "External call failed: Failing operation",
        expect.objectContaining({
          error: "string error",
        }),
      );
    });

    it("includes attributes in all log calls", async () => {
      const attributes = { indexName: "test-index", objectsCount: 5 };
      const operation = vi.fn().mockResolvedValue("result");

      await traceExternalCall(operation, {
        name: "Test operation",
        attributes,
      });

      expect(mockLogger.debug).toHaveBeenCalledWith("Starting: Test operation", attributes);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Test operation",
        expect.objectContaining(attributes),
      );
    });

    it("uses default 5000ms threshold when slowThresholdMs not provided", async () => {
      const operation = vi.fn().mockImplementation(async () => {
        // Advance time by 4999ms (just under default 5000ms threshold)
        vi.advanceTimersByTime(4999);

        return "result";
      });

      await traceExternalCall(operation, { name: "Test operation" });

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Test operation",
        expect.objectContaining({ durationMs: expect.any(Number) }),
      );
    });
  });
});
