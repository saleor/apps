import { ROOT_CONTEXT, SpanKind, SpanStatusCode, TraceFlags } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from "@opentelemetry/semantic-conventions";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TAIL_SAMPLING_PROMOTED_ATTR, TailSamplingProcessor } from "./tail-sampling-processor";

// Helper to create a mock ReadableSpan
const createMockSpan = (options: {
  traceFlags?: number;
  statusCode?: SpanStatusCode;
  events?: Array<{ name: string }>;
  attributes?: Record<string, unknown>;
  durationMs?: number;
  kind?: SpanKind;
  instrumentationLibraryName?: string;
}): ReadableSpan => {
  const {
    traceFlags = TraceFlags.NONE,
    statusCode = SpanStatusCode.UNSET,
    events = [],
    attributes = {},
    durationMs = 100,
    kind = SpanKind.INTERNAL,
    instrumentationLibraryName = "test",
  } = options;

  const startTime: [number, number] = [Math.floor(Date.now() / 1000), 0];
  const durationSeconds = Math.floor(durationMs / 1000);
  const durationNanos = (durationMs % 1000) * 1e6;
  const endTime: [number, number] = [startTime[0] + durationSeconds, durationNanos];

  return {
    spanContext: () => ({
      traceId: "0af7651916cd43dd8448eb211c80319c",
      spanId: "b7ad6b7169203331",
      traceFlags,
      isRemote: false,
    }),
    status: { code: statusCode },
    events,
    attributes,
    startTime,
    endTime,
    name: "test-span",
    kind,
    parentSpanId: undefined,
    duration: [0, durationMs * 1e6],
    ended: true,
    resource: { attributes: {} },
    instrumentationLibrary: { name: instrumentationLibraryName },
    links: [],
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
  } as unknown as ReadableSpan;
};

// Helper to create a mock SpanProcessor
const createMockProcessor = () => {
  return {
    onStart: vi.fn(),
    onEnd: vi.fn(),
    forceFlush: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
  } satisfies SpanProcessor;
};

describe("TailSamplingProcessor", () => {
  let mockProcessor: ReturnType<typeof createMockProcessor>;
  let tailSamplingProcessor: TailSamplingProcessor;

  beforeEach(() => {
    mockProcessor = createMockProcessor();
    tailSamplingProcessor = new TailSamplingProcessor({
      processor: mockProcessor,
      slowThresholdMs: 5000,
      exportErrors: true,
      exportSlowSpans: true,
    });
  });

  describe("onStart", () => {
    it("should pass through to downstream processor", () => {
      const mockSpan = {} as Span;

      tailSamplingProcessor.onStart(mockSpan, ROOT_CONTEXT);

      expect(mockProcessor.onStart).toHaveBeenCalledWith(mockSpan, ROOT_CONTEXT);
    });
  });

  describe("onEnd with already sampled spans", () => {
    it("should pass through sampled spans unchanged", () => {
      const span = createMockSpan({ traceFlags: TraceFlags.SAMPLED });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalledWith(span);
    });
  });

  describe("onEnd with non-sampled spans", () => {
    describe("error detection", () => {
      it("should export span with ERROR status", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          statusCode: SpanStatusCode.ERROR,
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).toHaveBeenCalled();
        const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

        expect(exportedSpan.spanContext().traceFlags & TraceFlags.SAMPLED).toBeTruthy();
        expect(exportedSpan.attributes[TAIL_SAMPLING_PROMOTED_ATTR]).toBe(true);
      });

      it("should export span with exception event", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          events: [{ name: "exception" }],
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).toHaveBeenCalled();
        const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

        expect(exportedSpan.spanContext().traceFlags & TraceFlags.SAMPLED).toBeTruthy();
      });

      it("should export span with HTTP 500+ status code", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          attributes: { [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500 },
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).toHaveBeenCalled();
        const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

        expect(exportedSpan.spanContext().traceFlags & TraceFlags.SAMPLED).toBeTruthy();
      });

      it("should not export span with HTTP 4xx status code", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          attributes: { [ATTR_HTTP_RESPONSE_STATUS_CODE]: 404 },
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      });
    });

    describe("slow span detection", () => {
      it("should export spans slower than threshold", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          durationMs: 6000, // 6 seconds, above 5s threshold
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).toHaveBeenCalled();
        const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

        expect(exportedSpan.spanContext().traceFlags & TraceFlags.SAMPLED).toBeTruthy();
      });

      it("should not export fast spans without errors", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          durationMs: 100, // 100ms, well below threshold
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      });
    });

    describe("normal spans", () => {
      it("should drop non-sampled spans without errors or slow response", () => {
        const span = createMockSpan({
          traceFlags: TraceFlags.NONE,
          statusCode: SpanStatusCode.OK,
          durationMs: 100,
        });

        tailSamplingProcessor.onEnd(span);

        expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      });
    });
  });

  describe("configuration options", () => {
    it("should respect exportErrors=false", () => {
      const processor = new TailSamplingProcessor({
        processor: mockProcessor,
        exportErrors: false,
        exportSlowSpans: false,
      });

      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
      });

      processor.onEnd(span);

      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
    });

    it("should respect exportSlowSpans=false", () => {
      const processor = new TailSamplingProcessor({
        processor: mockProcessor,
        exportErrors: false,
        exportSlowSpans: false,
        slowThresholdMs: 5000,
      });

      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        durationMs: 6000,
      });

      processor.onEnd(span);

      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
    });

    it("should use custom slowThresholdMs", () => {
      const processor = new TailSamplingProcessor({
        processor: mockProcessor,
        slowThresholdMs: 1000, // 1 second
      });

      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        durationMs: 1500, // 1.5 seconds
      });

      processor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
    });
  });

  describe("forceFlush", () => {
    it("should delegate to downstream processor", async () => {
      await tailSamplingProcessor.forceFlush();

      expect(mockProcessor.forceFlush).toHaveBeenCalled();
    });
  });

  describe("shutdown", () => {
    it("should delegate to downstream processor", async () => {
      await tailSamplingProcessor.shutdown();

      expect(mockProcessor.shutdown).toHaveBeenCalled();
    });
  });

  describe("resource attributes on promoted spans", () => {
    it("should add operation.name and resource.name for HTTP server spans", () => {
      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
        kind: SpanKind.SERVER,
        attributes: {
          "http.method": "POST",
          "http.route": "/api/webhooks",
        },
        instrumentationLibraryName: "@opentelemetry/instrumentation-http",
      });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe("web.request");
      expect(exportedSpan.attributes["resource.name"]).toBe("POST /api/webhooks");
    });

    it("should add operation.name with library and kind for non-HTTP spans", () => {
      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
        kind: SpanKind.CLIENT,
        instrumentationLibraryName: "@opentelemetry/instrumentation-http",
      });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe(
        "opentelemetry_instrumentation-http.client",
      );
    });

    it("should clean library name by removing @ and replacing . / with underscores", () => {
      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
        kind: SpanKind.SERVER,
        instrumentationLibraryName: "@saleor/apps-otel/fetch",
      });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe("saleor_apps-otel_fetch.server");
    });

    it("should not override existing operation.name attribute", () => {
      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
        kind: SpanKind.SERVER,
        attributes: {
          "operation.name": "custom.operation",
          "http.method": "POST",
          "http.route": "/api/webhooks",
        },
      });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe("custom.operation");
      expect(exportedSpan.attributes["resource.name"]).toBeUndefined();
    });

    it("should handle INTERNAL spans with just library name", () => {
      const span = createMockSpan({
        traceFlags: TraceFlags.NONE,
        statusCode: SpanStatusCode.ERROR,
        kind: SpanKind.INTERNAL,
        instrumentationLibraryName: "my-app",
      });

      tailSamplingProcessor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe("my-app");
    });
  });
});
