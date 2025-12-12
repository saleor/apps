import { Context, SpanStatusCode, TraceFlags } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from "@opentelemetry/semantic-conventions";

import {
  getVercelRequestContext,
  getVercelRequestContextAttributes,
} from "./vercel-request-context";
import { computeVercelResourceAttributes } from "./vercel-resource-attributes";

/**
 * Attribute to mark spans that were promoted by tail sampling.
 * Used by OTEL collector configuration to propagate spans manually marked as promoted by the app.
 */
export const TAIL_SAMPLING_PROMOTED_ATTR = "sampling.promoted_by_tail_sampler";

export interface TraceBufferingTailSamplingProcessorConfig {
  /**
   * The downstream processor to send sampled spans to.
   * Typically a BatchSpanProcessor.
   */
  processor: SpanProcessor;

  /**
   * Latency threshold in milliseconds. Traces with spans slower than this are always exported.
   * @default 5000 (5 seconds)
   */
  slowThresholdMs?: number;

  /**
   * Timeout in milliseconds for how long to buffer traces.
   * Traces older than this are cleaned up (and exported if they have errors/slow spans).
   * @default 55000 (55 seconds, under Vercel's 60s timeout)
   */
  bufferTimeoutMs?: number;

  /**
   * Maximum number of traces to buffer. Oldest traces are evicted when exceeded.
   * @default 1000
   */
  maxTraces?: number;

  /**
   * Maximum number of spans to buffer per trace. Oldest spans are dropped when exceeded.
   * @default 100
   */
  maxSpansPerTrace?: number;

  /**
   * Whether to always export error spans.
   * @default true
   */
  exportErrors?: boolean;

  /**
   * Whether to always export slow spans.
   * @default true
   */
  exportSlowSpans?: boolean;
}

interface TraceBuffer {
  spans: ReadableSpan[];
  localRootSpanId: string | undefined;
  localRootEnded: boolean;
  createdAt: number;
  hasError: boolean;
  hasSlow: boolean;
  /**
   * Capture the request context early; by the time onEnd runs we still expect it
   * to be available, but storing it avoids edge cases.
   */
  vercelRequestContext?: ReturnType<typeof getVercelRequestContext>;
}

/**
 * Check if SAMPLED flag is set in traceFlags bitmask.
 */
function isSampled(traceFlags: number): boolean {
  return (traceFlags & TraceFlags.SAMPLED) !== 0;
}

/**
 * A SpanProcessor that implements trace-level tail sampling with buffering.
 *
 * Unlike TailSamplingProcessor which makes per-span decisions (causing "swiss cheese" traces),
 * this processor buffers all spans for a trace and makes a single export decision
 * when the local root span ends.
 *
 * When ANY span in a trace has an error or is slow, ALL buffered spans for that trace
 * are exported together. This ensures complete traces for debugging.
 *
 * Key behaviors:
 * - Already-sampled traces pass through immediately (no buffering)
 * - Non-sampled traces are buffered until local root ends
 * - Export decision based on any error/slow span in the entire trace
 * - Calls waitUntil() for promoted traces to ensure flush on Vercel
 *
 * Memory protection:
 * - maxTraces: caps total buffered traces (evicts oldest)
 * - maxSpansPerTrace: caps spans per trace (drops oldest spans)
 * - bufferTimeoutMs: cleans up stale buffers
 */
export class TraceBufferingTailSamplingProcessor implements SpanProcessor {
  private traceBuffers = new Map<string, TraceBuffer>();
  private readonly processor: SpanProcessor;
  private readonly slowThresholdMs: number;
  private readonly bufferTimeoutMs: number;
  private readonly maxTraces: number;
  private readonly maxSpansPerTrace: number;
  private readonly exportErrors: boolean;
  private readonly exportSlowSpans: boolean;

  constructor(config: TraceBufferingTailSamplingProcessorConfig) {
    this.processor = config.processor;
    this.slowThresholdMs = config.slowThresholdMs ?? 5000;
    this.bufferTimeoutMs = config.bufferTimeoutMs ?? 55000;
    this.maxTraces = config.maxTraces ?? 1000;
    this.maxSpansPerTrace = config.maxSpansPerTrace ?? 100;
    this.exportErrors = config.exportErrors ?? true;
    this.exportSlowSpans = config.exportSlowSpans ?? true;
  }

  onStart(span: Span, parentContext: Context): void {
    // Always delegate to downstream processor first
    this.processor.onStart(span, parentContext);

    const { traceId, spanId, traceFlags } = span.spanContext();

    // Never buffer already-sampled traces (avoid memory leaks)
    if (isSampled(traceFlags)) {
      return;
    }

    /*
     * Mirror @vercel/otel CompositeSpanProcessor root logic:
     * First span we see for a traceId is treated as local root.
     */
    const isFirstSpanInTrace = !this.traceBuffers.has(traceId);

    if (isFirstSpanInTrace) {
      // Clean up stale buffers on access (serverless-friendly, no background intervals)
      this.cleanupStaleBuffers();

      // Evict oldest traces if at capacity
      this.evictOldestTraces();

      this.traceBuffers.set(traceId, {
        spans: [],
        localRootSpanId: spanId,
        localRootEnded: false,
        createdAt: Date.now(),
        hasError: false,
        hasSlow: false,
        vercelRequestContext: getVercelRequestContext(),
      });
    }
  }

  onEnd(span: ReadableSpan): void {
    const spanContext = span.spanContext();
    const { traceId, spanId, traceFlags } = spanContext;

    // If already sampled, pass through directly (no buffering)
    if (isSampled(traceFlags)) {
      this.processor.onEnd(span);

      return;
    }

    const buffer = this.traceBuffers.get(traceId);

    // No buffer = this trace was never tracked (shouldn't happen, but be defensive)
    if (!buffer) {
      return;
    }

    // Update error/slow flags based on this span
    if (this.exportErrors && this.isError(span)) {
      buffer.hasError = true;
    }

    if (this.exportSlowSpans && this.isSlow(span)) {
      buffer.hasSlow = true;
    }

    // Add span to buffer (with cap enforcement)
    this.addSpanToBuffer(buffer, span);

    // Check if this is the local root span ending
    if (spanId === buffer.localRootSpanId) {
      buffer.localRootEnded = true;
      this.finalizeTrace(traceId);
    }
  }

  forceFlush(): Promise<void> {
    return this.processor.forceFlush();
  }

  shutdown(): Promise<void> {
    // Export any remaining buffered traces that have errors/slow spans
    for (const [traceId, buffer] of this.traceBuffers) {
      if (buffer.hasError || buffer.hasSlow) {
        this.exportBuffer(buffer);
      }

      this.traceBuffers.delete(traceId);
    }

    return this.processor.shutdown();
  }

  /**
   * Add span to buffer with maxSpansPerTrace enforcement.
   * When exceeded, oldest spans are dropped.
   */
  private addSpanToBuffer(buffer: TraceBuffer, span: ReadableSpan): void {
    if (buffer.spans.length >= this.maxSpansPerTrace) {
      // Drop oldest span
      buffer.spans.shift();
    }

    buffer.spans.push(span);
  }

  /**
   * Finalize trace when local root ends.
   * Exports all buffered spans if any had errors or were slow.
   */
  private finalizeTrace(traceId: string): void {
    const buffer = this.traceBuffers.get(traceId);

    if (!buffer) {
      return;
    }

    const shouldExport = buffer.hasError || buffer.hasSlow;

    if (shouldExport) {
      this.exportBuffer(buffer);

      /*
       * CRITICAL: Schedule waitUntil for flush
       * This ensures promoted spans are flushed before the request ends on Vercel
       */
      const vrc = buffer.vercelRequestContext ?? getVercelRequestContext();

      vrc?.waitUntil(this.processor.forceFlush());
    }

    this.traceBuffers.delete(traceId);
  }

  /**
   * Export all spans from a buffer.
   */
  private exportBuffer(buffer: TraceBuffer): void {
    for (const span of buffer.spans) {
      const sampledSpan = this.promoteToSampled(span);

      this.processor.onEnd(sampledSpan);
    }
  }

  /**
   * Clean up stale buffers that have exceeded the timeout.
   * Called on-access (serverless-friendly, no background intervals).
   */
  private cleanupStaleBuffers(): void {
    const now = Date.now();

    for (const [traceId, buffer] of this.traceBuffers) {
      if (now - buffer.createdAt > this.bufferTimeoutMs) {
        // Export if it had errors/slow spans, otherwise just drop
        if (buffer.hasError || buffer.hasSlow) {
          this.exportBuffer(buffer);

          const vrc = buffer.vercelRequestContext ?? getVercelRequestContext();

          vrc?.waitUntil(this.processor.forceFlush());
        }

        this.traceBuffers.delete(traceId);
      }
    }
  }

  /**
   * Evict oldest traces if at maxTraces capacity.
   */
  private evictOldestTraces(): void {
    while (this.traceBuffers.size >= this.maxTraces) {
      // Map iteration order is insertion order, so first key is oldest
      const oldestTraceId = this.traceBuffers.keys().next().value;

      if (oldestTraceId) {
        const buffer = this.traceBuffers.get(oldestTraceId);

        // Export if it had errors/slow spans before evicting
        if (buffer && (buffer.hasError || buffer.hasSlow)) {
          this.exportBuffer(buffer);
        }

        this.traceBuffers.delete(oldestTraceId);
      }
    }
  }

  /**
   * Determine if a span has an error.
   */
  private isError(span: ReadableSpan): boolean {
    // Check span status
    if (span.status.code === SpanStatusCode.ERROR) {
      return true;
    }

    // Check for recorded exceptions
    if (span.events.some((event) => event.name === "exception")) {
      return true;
    }

    // Check HTTP status code attribute (covers both old and new semconv)
    const httpStatusCode =
      span.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE] ?? span.attributes["http.status_code"];

    if (typeof httpStatusCode === "number" && httpStatusCode >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Determine if a span is slow.
   */
  private isSlow(span: ReadableSpan): boolean {
    /*
     * Calculate duration in milliseconds
     * span.startTime and span.endTime are [seconds, nanoseconds] tuples
     */
    const startMs = span.startTime[0] * 1000 + span.startTime[1] / 1e6;
    const endMs = span.endTime[0] * 1000 + span.endTime[1] / 1e6;
    const durationMs = endMs - startMs;

    return durationMs >= this.slowThresholdMs;
  }

  /**
   * Create a modified span with SAMPLED flag set and additional attributes.
   *
   * Since spanContext is supposed to be immutable, we use Object.create()
   * to create a new object that inherits from the original but overrides
   * the spanContext method using Object.defineProperty.
   */
  private promoteToSampled(span: ReadableSpan): ReadableSpan {
    const originalContext = span.spanContext();

    // Create modified spanContext with SAMPLED flag
    const sampledContext = {
      ...originalContext,
      traceFlags: originalContext.traceFlags | TraceFlags.SAMPLED,
    };

    /*
     * Build new attributes with:
     * 1. Original span attributes
     * 2. Promotion marker
     * 3. DataDog resource attrs (operation.name, resource.name)
     * 4. Vercel request-context attrs (vercel.request_id, etc.)
     */
    const newAttributes = {
      ...span.attributes,
      [TAIL_SAMPLING_PROMOTED_ATTR]: true,
      ...computeVercelResourceAttributes(span),
      ...getVercelRequestContextAttributes(),
    };

    // Create a new object that inherits from span but overrides spanContext
    const sampledSpan = Object.create(span) as ReadableSpan;

    // Override spanContext method
    Object.defineProperty(sampledSpan, "spanContext", {
      value: () => sampledContext,
      enumerable: true,
    });

    // Override attributes getter
    Object.defineProperty(sampledSpan, "attributes", {
      value: newAttributes,
      enumerable: true,
    });

    return sampledSpan;
  }
}
