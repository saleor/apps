import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTraceEffect, DEFAULT_SLOW_THRESHOLD_MS } from "./trace-effect";

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  getSubLogger: vi.fn(() => mockLogger),
}));

vi.mock("@saleor/apps-logger", () => ({
  rootLogger: mockLogger,
}));

describe("trace-effect", () => {
  describe("createTraceEffect", () => {
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
      const trace = createTraceEffect({ name: "Test operation" });

      const result = await trace(operation);

      expect(result).toStrictEqual(expectedResult);
      expect(operation).toHaveBeenCalledOnce();
    });

    it("throws when operation fails", async () => {
      const error = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(error);
      const trace = createTraceEffect({ name: "Test operation" });

      await expect(trace(operation)).rejects.toThrow("Operation failed");
    });

    it("logs debug on start and finish for fast operations", async () => {
      const operation = vi.fn().mockResolvedValue("result");
      const trace = createTraceEffect({ name: "Test operation" });

      await trace(operation, { foo: "bar" });

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
      const trace = createTraceEffect({ name: "Slow operation", slowThresholdMs: 100 });

      await trace(operation);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Slow effect: Slow operation",
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
      const trace = createTraceEffect({ name: "Fast operation", slowThresholdMs: 100 });

      await trace(operation);

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Fast operation",
        expect.objectContaining({ durationMs: expect.any(Number) }),
      );
    });

    it("logs error when operation fails", async () => {
      const error = new Error("Something went wrong");
      const operation = vi.fn().mockRejectedValue(error);
      const trace = createTraceEffect({ name: "Failing operation" });

      await expect(trace(operation)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Effect failed: Failing operation",
        expect.objectContaining({
          durationMs: expect.any(Number),
          error: "Something went wrong",
        }),
      );
    });

    it("logs error with string representation for non-Error objects", async () => {
      const operation = vi.fn().mockRejectedValue("string error");
      const trace = createTraceEffect({ name: "Failing operation" });

      await expect(trace(operation)).rejects.toBe("string error");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Effect failed: Failing operation",
        expect.objectContaining({
          error: "string error",
        }),
      );
    });

    it("includes attributes in all log calls", async () => {
      const attributes = { indexName: "test-index", objectsCount: 5 };
      const operation = vi.fn().mockResolvedValue("result");
      const trace = createTraceEffect({ name: "Test operation" });

      await trace(operation, attributes);

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
      const trace = createTraceEffect({ name: "Test operation" });

      await trace(operation);

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Finished: Test operation",
        expect.objectContaining({ durationMs: expect.any(Number) }),
      );
    });

    it("exports DEFAULT_SLOW_THRESHOLD_MS constant", () => {
      expect(DEFAULT_SLOW_THRESHOLD_MS).toBe(5000);
    });
  });
});
