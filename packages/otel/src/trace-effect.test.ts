import { SpanStatusCode } from "@opentelemetry/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTraceEffect } from "./trace-effect";

const mockSpan = vi.hoisted(() => ({
  setAttribute: vi.fn(),
  setStatus: vi.fn(),
  recordException: vi.fn(),
  end: vi.fn(),
}));

const mockTracer = vi.hoisted(() => ({
  startSpan: vi.fn(() => mockSpan),
}));

vi.mock("@opentelemetry/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@opentelemetry/api")>();

  return {
    ...actual,
    trace: {
      getTracer: () => mockTracer,
    },
    context: {
      active: () => ({}),
    },
  };
});

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

    describe("OTEL spans", () => {
      it("creates a span with the operation name", async () => {
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({ name: "My Operation" });

        await trace(operation);

        expect(mockTracer.startSpan).toHaveBeenCalledWith(
          "My Operation",
          { attributes: {} },
          expect.anything(),
        );
      });

      it("passes initial attributes to startSpan", async () => {
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({ name: "Test" });

        await trace(operation, { indexName: "products", count: 5 });

        expect(mockTracer.startSpan).toHaveBeenCalledWith(
          "Test",
          { attributes: { indexName: "products", count: 5 } },
          expect.anything(),
        );
      });

      it("sets OK status and ends span on successful fast operation", async () => {
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({ name: "Fast", slowThresholdMs: 100 });

        await trace(operation);

        expect(mockSpan.setAttribute).toHaveBeenCalledWith("trace_effect.is_slow", false);
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK });
        expect(mockSpan.end).toHaveBeenCalled();
      });

      it("sets ERROR status on slow operation", async () => {
        const operation = vi.fn().mockImplementation(async () => {
          vi.advanceTimersByTime(150);

          return "result";
        });
        const trace = createTraceEffect({ name: "Slow", slowThresholdMs: 100 });

        await trace(operation);

        expect(mockSpan.setAttribute).toHaveBeenCalledWith("trace_effect.is_slow", true);
        expect(mockSpan.setStatus).toHaveBeenCalledWith({
          code: SpanStatusCode.ERROR,
          message: expect.stringContaining("exceeded slow threshold"),
        });
        expect(mockSpan.end).toHaveBeenCalled();
      });

      it("records exception and sets ERROR status on failure", async () => {
        const error = new Error("Something went wrong");
        const operation = vi.fn().mockRejectedValue(error);
        const trace = createTraceEffect({ name: "Failing" });

        await expect(trace(operation)).rejects.toThrow();

        expect(mockSpan.recordException).toHaveBeenCalledWith(error);
        expect(mockSpan.setStatus).toHaveBeenCalledWith({
          code: SpanStatusCode.ERROR,
          message: "Something went wrong",
        });
        expect(mockSpan.end).toHaveBeenCalled();
      });

      it("sets duration attributes on span", async () => {
        const operation = vi.fn().mockImplementation(async () => {
          vi.advanceTimersByTime(50);

          return "result";
        });
        const trace = createTraceEffect({ name: "Test", slowThresholdMs: 100 });

        await trace(operation);

        expect(mockSpan.setAttribute).toHaveBeenCalledWith("trace_effect.duration_ms", 50);
        expect(mockSpan.setAttribute).toHaveBeenCalledWith("trace_effect.slow_threshold_ms", 100);
      });
    });

    describe("callbacks", () => {
      it("calls onStart callback at the beginning", async () => {
        const onStart = vi.fn();
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({ name: "Test", callbacks: { onStart } });

        await trace(operation, { foo: "bar" });

        expect(onStart).toHaveBeenCalledWith("Test", { attributes: { foo: "bar" } });
      });

      it("calls onFinish callback on successful fast operation", async () => {
        const onFinish = vi.fn();
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({
          name: "Test",
          slowThresholdMs: 100,
          callbacks: { onFinish },
        });

        await trace(operation, { foo: "bar" });

        expect(onFinish).toHaveBeenCalledWith("Test", {
          attributes: { foo: "bar" },
          durationMs: expect.any(Number),
        });
      });

      it("calls onSlow callback when operation exceeds threshold", async () => {
        const onSlow = vi.fn();
        const onFinish = vi.fn();
        const operation = vi.fn().mockImplementation(async () => {
          vi.advanceTimersByTime(150);

          return "result";
        });
        const trace = createTraceEffect({
          name: "Test",
          slowThresholdMs: 100,
          callbacks: { onSlow, onFinish },
        });

        await trace(operation, { foo: "bar" });

        expect(onSlow).toHaveBeenCalledWith("Test", {
          attributes: { foo: "bar" },
          durationMs: expect.any(Number),
          slowThresholdMs: 100,
        });
        expect(onFinish).not.toHaveBeenCalled();
      });

      it("calls onError callback when operation fails", async () => {
        const onError = vi.fn();
        const error = new Error("Failed!");
        const operation = vi.fn().mockRejectedValue(error);
        const trace = createTraceEffect({ name: "Test", callbacks: { onError } });

        await expect(trace(operation, { foo: "bar" })).rejects.toThrow();

        expect(onError).toHaveBeenCalledWith("Test", {
          attributes: { foo: "bar" },
          durationMs: expect.any(Number),
          error: "Failed!",
        });
      });

      it("handles non-Error objects in onError callback", async () => {
        const onError = vi.fn();
        const operation = vi.fn().mockRejectedValue("string error");
        const trace = createTraceEffect({ name: "Test", callbacks: { onError } });

        await expect(trace(operation)).rejects.toBe("string error");

        expect(onError).toHaveBeenCalledWith("Test", {
          attributes: {},
          durationMs: expect.any(Number),
          error: "string error",
        });
      });

      it("works without any callbacks", async () => {
        const operation = vi.fn().mockResolvedValue("result");
        const trace = createTraceEffect({ name: "Test" });

        const result = await trace(operation);

        expect(result).toBe("result");
      });
    });
  });
});
