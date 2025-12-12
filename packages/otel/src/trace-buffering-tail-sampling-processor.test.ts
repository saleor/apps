import { ROOT_CONTEXT, SpanKind, SpanStatusCode, TraceFlags } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from "@opentelemetry/semantic-conventions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TAIL_SAMPLING_PROMOTED_ATTR,
  TraceBufferingTailSamplingProcessor,
} from "./trace-buffering-tail-sampling-processor";

// Mock Vercel request context
const mockWaitUntil = vi.fn();
const mockVercelRequestContext = {
  waitUntil: mockWaitUntil,
  headers: {
    "x-vercel-id": "test-request-id",
    "x-matched-path": "/api/test",
    host: "example.com",
  },
  url: "https://example.com/api/test",
};

vi.mock("./vercel-request-context", () => ({
  getVercelRequestContext: vi.fn(() => mockVercelRequestContext),
  getVercelRequestContextAttributes: vi.fn(() => ({
    "vercel.request_id": "test-request-id",
    "vercel.matched_path": "/api/test",
    "http.host": "example.com",
  })),
}));

// Helper to create a mock Span (for onStart)
const createMockSpan = (options: {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
}): Span => {
  const { traceId = "trace-1", spanId = "span-1", traceFlags = TraceFlags.NONE } = options;

  return {
    spanContext: () => ({
      traceId,
      spanId,
      traceFlags,
      isRemote: false,
    }),
  } as unknown as Span;
};

// Helper to create a mock ReadableSpan (for onEnd)
const createMockReadableSpan = (options: {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
  statusCode?: SpanStatusCode;
  events?: Array<{ name: string }>;
  attributes?: Record<string, unknown>;
  durationMs?: number;
  kind?: SpanKind;
  instrumentationLibraryName?: string;
}): ReadableSpan => {
  const {
    traceId = "trace-1",
    spanId = "span-1",
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
      traceId,
      spanId,
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

describe("TraceBufferingTailSamplingProcessor", () => {
  let mockProcessor: ReturnType<typeof createMockProcessor>;
  let processor: TraceBufferingTailSamplingProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessor = createMockProcessor();
    processor = new TraceBufferingTailSamplingProcessor({
      processor: mockProcessor,
      slowThresholdMs: 5000,
      bufferTimeoutMs: 55000,
      maxTraces: 1000,
      maxSpansPerTrace: 100,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("onStart", () => {
    it("should pass through to downstream processor", () => {
      const span = createMockSpan({});

      processor.onStart(span, ROOT_CONTEXT);

      expect(mockProcessor.onStart).toHaveBeenCalledWith(span, ROOT_CONTEXT);
    });

    it("should not create buffer for already-sampled traces", () => {
      const span = createMockSpan({ traceFlags: TraceFlags.SAMPLED });

      processor.onStart(span, ROOT_CONTEXT);

      // Verify no buffer created by trying to end the span - should pass through
      const readableSpan = createMockReadableSpan({
        traceId: "trace-1",
        spanId: "span-1",
        traceFlags: TraceFlags.SAMPLED,
      });

      processor.onEnd(readableSpan);

      expect(mockProcessor.onEnd).toHaveBeenCalledWith(readableSpan);
    });

    it("should create buffer for non-sampled traces", () => {
      const span = createMockSpan({ traceFlags: TraceFlags.NONE });

      processor.onStart(span, ROOT_CONTEXT);

      // Verify buffer exists by ending a normal span - should NOT pass through immediately
      const readableSpan = createMockReadableSpan({
        traceId: "trace-1",
        spanId: "span-2", // Different span, not the root
        traceFlags: TraceFlags.NONE,
      });

      processor.onEnd(readableSpan);

      // Not passed through because buffered and root hasn't ended
      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
    });
  });

  describe("onEnd with already-sampled spans", () => {
    it("should pass through sampled spans unchanged", () => {
      const span = createMockReadableSpan({ traceFlags: TraceFlags.SAMPLED });

      processor.onEnd(span);

      expect(mockProcessor.onEnd).toHaveBeenCalledWith(span);
    });
  });

  describe("onEnd with non-sampled spans", () => {
    describe("trace buffering", () => {
      it("should buffer spans until local root ends", () => {
        // Start root span
        const rootSpan = createMockSpan({ traceId: "trace-1", spanId: "root-span" });

        processor.onStart(rootSpan, ROOT_CONTEXT);

        // Start child span
        const childSpan = createMockSpan({ traceId: "trace-1", spanId: "child-span" });

        processor.onStart(childSpan, ROOT_CONTEXT);

        // End child span (with error)
        const childReadable = createMockReadableSpan({
          traceId: "trace-1",
          spanId: "child-span",
          statusCode: SpanStatusCode.ERROR,
        });

        processor.onEnd(childReadable);

        // Not exported yet - waiting for root
        expect(mockProcessor.onEnd).not.toHaveBeenCalled();

        // End root span
        const rootReadable = createMockReadableSpan({
          traceId: "trace-1",
          spanId: "root-span",
        });

        processor.onEnd(rootReadable);

        // Now both spans should be exported
        expect(mockProcessor.onEnd).toHaveBeenCalledTimes(2);
      });

      it("should export ALL spans when any span has error", () => {
        const rootSpan = createMockSpan({ traceId: "trace-1", spanId: "root" });

        processor.onStart(rootSpan, ROOT_CONTEXT);

        // Create 3 child spans, only one has error
        for (let i = 1; i <= 3; i++) {
          const childSpan = createMockSpan({ traceId: "trace-1", spanId: `child-${i}` });

          processor.onStart(childSpan, ROOT_CONTEXT);
        }

        // End children - only child-2 has error
        for (let i = 1; i <= 3; i++) {
          processor.onEnd(
            createMockReadableSpan({
              traceId: "trace-1",
              spanId: `child-${i}`,
              statusCode: i === 2 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
            }),
          );
        }

        // End root
        processor.onEnd(createMockReadableSpan({ traceId: "trace-1", spanId: "root" }));

        // All 4 spans exported
        expect(mockProcessor.onEnd).toHaveBeenCalledTimes(4);
      });

      it("should drop all spans when no error/slow", () => {
        const rootSpan = createMockSpan({ traceId: "trace-1", spanId: "root" });

        processor.onStart(rootSpan, ROOT_CONTEXT);

        const childSpan = createMockSpan({ traceId: "trace-1", spanId: "child" });

        processor.onStart(childSpan, ROOT_CONTEXT);

        // End both with OK status and fast duration
        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "child",
            statusCode: SpanStatusCode.OK,
            durationMs: 100,
          }),
        );

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "root",
            statusCode: SpanStatusCode.OK,
            durationMs: 100,
          }),
        );

        // No spans exported
        expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      });
    });

    describe("error detection", () => {
      it("should detect ERROR status", () => {
        const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

        processor.onStart(span, ROOT_CONTEXT);

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "span-1",
            statusCode: SpanStatusCode.ERROR,
          }),
        );

        expect(mockProcessor.onEnd).toHaveBeenCalled();

        const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

        expect(exportedSpan.spanContext().traceFlags & TraceFlags.SAMPLED).toBeTruthy();
        expect(exportedSpan.attributes[TAIL_SAMPLING_PROMOTED_ATTR]).toBe(true);
      });

      it("should detect exception events", () => {
        const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

        processor.onStart(span, ROOT_CONTEXT);

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "span-1",
            events: [{ name: "exception" }],
          }),
        );

        expect(mockProcessor.onEnd).toHaveBeenCalled();
      });

      it("should detect HTTP 500+ status (new semconv)", () => {
        const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

        processor.onStart(span, ROOT_CONTEXT);

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "span-1",
            attributes: { [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500 },
          }),
        );

        expect(mockProcessor.onEnd).toHaveBeenCalled();
      });

      it("should detect HTTP 500+ status (old semconv)", () => {
        const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

        processor.onStart(span, ROOT_CONTEXT);

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "span-1",
            attributes: { "http.status_code": 503 },
          }),
        );

        expect(mockProcessor.onEnd).toHaveBeenCalled();
      });

      it("should not export on HTTP 4xx status", () => {
        const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

        processor.onStart(span, ROOT_CONTEXT);

        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "span-1",
            attributes: { [ATTR_HTTP_RESPONSE_STATUS_CODE]: 404 },
          }),
        );

        expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      });
    });

    describe("slow span detection", () => {
      it("should export when any span is slow", () => {
        const rootSpan = createMockSpan({ traceId: "trace-1", spanId: "root" });

        processor.onStart(rootSpan, ROOT_CONTEXT);

        const childSpan = createMockSpan({ traceId: "trace-1", spanId: "child" });

        processor.onStart(childSpan, ROOT_CONTEXT);

        // Child is slow
        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "child",
            durationMs: 6000, // Above 5s threshold
          }),
        );

        // Root is fast
        processor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: "root",
            durationMs: 100,
          }),
        );

        // Both exported because child was slow
        expect(mockProcessor.onEnd).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("waitUntil integration", () => {
    it("should call waitUntil when promoting spans", () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          statusCode: SpanStatusCode.ERROR,
        }),
      );

      expect(mockWaitUntil).toHaveBeenCalled();
    });

    it("should not call waitUntil when dropping spans", () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          statusCode: SpanStatusCode.OK,
          durationMs: 100,
        }),
      );

      expect(mockWaitUntil).not.toHaveBeenCalled();
    });
  });

  describe("memory bounds", () => {
    it("should evict oldest traces when maxTraces exceeded", () => {
      const smallProcessor = new TraceBufferingTailSamplingProcessor({
        processor: mockProcessor,
        maxTraces: 2,
      });

      // Create 3 traces
      for (let i = 1; i <= 3; i++) {
        const span = createMockSpan({ traceId: `trace-${i}`, spanId: `span-${i}` });

        smallProcessor.onStart(span, ROOT_CONTEXT);

        // Add error to all traces
        smallProcessor.onEnd(
          createMockReadableSpan({
            traceId: `trace-${i}`,
            spanId: `span-${i}-child`,
            statusCode: SpanStatusCode.ERROR,
          }),
        );
      }

      // First trace should have been evicted and exported
      expect(mockProcessor.onEnd).toHaveBeenCalled();
    });

    it("should drop oldest spans when maxSpansPerTrace exceeded", () => {
      const smallProcessor = new TraceBufferingTailSamplingProcessor({
        processor: mockProcessor,
        maxSpansPerTrace: 2,
      });

      const rootSpan = createMockSpan({ traceId: "trace-1", spanId: "root" });

      smallProcessor.onStart(rootSpan, ROOT_CONTEXT);

      // Create 3 child spans
      for (let i = 1; i <= 3; i++) {
        const childSpan = createMockSpan({ traceId: "trace-1", spanId: `child-${i}` });

        smallProcessor.onStart(childSpan, ROOT_CONTEXT);
        smallProcessor.onEnd(
          createMockReadableSpan({
            traceId: "trace-1",
            spanId: `child-${i}`,
            statusCode: i === 3 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
          }),
        );
      }

      // End root
      smallProcessor.onEnd(createMockReadableSpan({ traceId: "trace-1", spanId: "root" }));

      // Only 2 spans exported (maxSpansPerTrace)
      expect(mockProcessor.onEnd).toHaveBeenCalledTimes(2);
    });
  });

  describe("Vercel request context attributes", () => {
    it("should add vercel attributes to promoted spans", () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          statusCode: SpanStatusCode.ERROR,
        }),
      );

      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["vercel.request_id"]).toBe("test-request-id");
      expect(exportedSpan.attributes["vercel.matched_path"]).toBe("/api/test");
      expect(exportedSpan.attributes["http.host"]).toBe("example.com");
    });
  });

  describe("resource attributes on promoted spans", () => {
    it("should add operation.name and resource.name for HTTP server spans", () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          statusCode: SpanStatusCode.ERROR,
          kind: SpanKind.SERVER,
          attributes: {
            "http.method": "POST",
            "http.route": "/api/webhooks",
          },
          instrumentationLibraryName: "@opentelemetry/instrumentation-http",
        }),
      );

      const exportedSpan = mockProcessor.onEnd.mock.calls[0][0];

      expect(exportedSpan.attributes["operation.name"]).toBe("web.request");
      expect(exportedSpan.attributes["resource.name"]).toBe("POST /api/webhooks");
    });
  });

  describe("forceFlush", () => {
    it("should delegate to downstream processor", async () => {
      await processor.forceFlush();

      expect(mockProcessor.forceFlush).toHaveBeenCalled();
    });
  });

  describe("shutdown", () => {
    it("should export buffered error traces and delegate to downstream", async () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      // Add span with error but don't end root
      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-2",
          statusCode: SpanStatusCode.ERROR,
        }),
      );

      // Nothing exported yet
      expect(mockProcessor.onEnd).not.toHaveBeenCalled();

      // Shutdown should export buffered error traces
      await processor.shutdown();

      expect(mockProcessor.onEnd).toHaveBeenCalled();
      expect(mockProcessor.shutdown).toHaveBeenCalled();
    });

    it("should not export buffered traces without errors on shutdown", async () => {
      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      processor.onStart(span, ROOT_CONTEXT);

      processor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-2",
          statusCode: SpanStatusCode.OK,
        }),
      );

      await processor.shutdown();

      // Only shutdown called, no spans exported
      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
      expect(mockProcessor.shutdown).toHaveBeenCalled();
    });
  });

  describe("configuration options", () => {
    it("should respect exportErrors=false", () => {
      const configuredProcessor = new TraceBufferingTailSamplingProcessor({
        processor: mockProcessor,
        exportErrors: false,
        exportSlowSpans: false,
      });

      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      configuredProcessor.onStart(span, ROOT_CONTEXT);

      configuredProcessor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          statusCode: SpanStatusCode.ERROR,
        }),
      );

      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
    });

    it("should respect exportSlowSpans=false", () => {
      const configuredProcessor = new TraceBufferingTailSamplingProcessor({
        processor: mockProcessor,
        exportErrors: false,
        exportSlowSpans: false,
      });

      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      configuredProcessor.onStart(span, ROOT_CONTEXT);

      configuredProcessor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          durationMs: 10000,
        }),
      );

      expect(mockProcessor.onEnd).not.toHaveBeenCalled();
    });

    it("should use custom slowThresholdMs", () => {
      const configuredProcessor = new TraceBufferingTailSamplingProcessor({
        processor: mockProcessor,
        slowThresholdMs: 1000, // 1 second
      });

      const span = createMockSpan({ traceId: "trace-1", spanId: "span-1" });

      configuredProcessor.onStart(span, ROOT_CONTEXT);

      configuredProcessor.onEnd(
        createMockReadableSpan({
          traceId: "trace-1",
          spanId: "span-1",
          durationMs: 1500, // 1.5 seconds
        }),
      );

      expect(mockProcessor.onEnd).toHaveBeenCalled();
    });
  });
});
