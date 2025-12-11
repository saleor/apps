import { Context, SpanStatusCode, TraceFlags } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from "@opentelemetry/semantic-conventions";

import { computeVercelResourceAttributes } from "./vercel-resource-attributes";

export interface TailSamplingProcessorConfig {
  /**
   * The downstream processor to send sampled spans to.
   * Typically a BatchSpanProcessor.
   */
  processor: SpanProcessor;

  /**
   * Latency threshold in milliseconds. Spans slower than this are always exported.
   * @default 5000 (5 seconds)
   */
  slowThresholdMs?: number;

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

/**
 * Attribute to mark spans that were promoted by tail sampling.
 * Used by OTEL collector configuration to propagate spans manually marked as promoted by the app.
 */
export const TAIL_SAMPLING_PROMOTED_ATTR = "sampling.promoted_by_tail_sampler";

/**
 * A SpanProcessor that implements SDK-level tail sampling.
 *
 * For spans that were recorded but not sampled (RECORD decision),
 * this processor checks at span end if the span should be exported
 * based on error status or latency.
 *
 * If the span should be exported, it modifies the span's traceFlags
 * to include the SAMPLED flag before passing to the downstream processor.
 *
 * For spans that were already sampled it doesn't change them
 */
export class TailSamplingProcessor implements SpanProcessor {
  private readonly processor: SpanProcessor;
  private readonly slowThresholdMs: number;
  private readonly exportErrors: boolean;
  private readonly exportSlowSpans: boolean;

  constructor(config: TailSamplingProcessorConfig) {
    this.processor = config.processor;
    this.slowThresholdMs = config.slowThresholdMs ?? 5000;
    this.exportErrors = config.exportErrors ?? true;
    this.exportSlowSpans = config.exportSlowSpans ?? true;
  }

  onStart(span: Span, parentContext: Context): void {
    // Pass through to downstream processor
    this.processor.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    const spanContext = span.spanContext();
    const isAlreadySampled = (spanContext.traceFlags & TraceFlags.SAMPLED) !== 0;

    // If already sampled, pass through directly
    if (isAlreadySampled) {
      this.processor.onEnd(span);

      return;
    }

    // Span was recorded but not sampled - check if we should export it
    const shouldExport = this.shouldExport(span);

    if (shouldExport) {
      // Promote span to SAMPLED by creating a modified version
      const sampledSpan = this.promoteToSampled(span);

      this.processor.onEnd(sampledSpan);
    }
    // If not shouldExport, span is dropped (not passed to downstream)
  }

  forceFlush(): Promise<void> {
    return this.processor.forceFlush();
  }

  shutdown(): Promise<void> {
    return this.processor.shutdown();
  }

  /**
   * Determine if a non-sampled span should be exported.
   */
  private shouldExport(span: ReadableSpan): boolean {
    // Check for errors
    if (this.exportErrors && this.isError(span)) {
      return true;
    }

    // Check for slow spans
    if (this.exportSlowSpans && this.isSlow(span)) {
      return true;
    }

    return false;
  }

  private isError(span: ReadableSpan): boolean {
    // Check span status
    if (span.status.code === SpanStatusCode.ERROR) {
      return true;
    }

    // Check for recorded exceptions
    if (span.events.some((event) => event.name === "exception")) {
      return true;
    }

    // Check HTTP status code attribute (using semantic convention)
    const httpStatusCode = span.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE];

    if (typeof httpStatusCode === "number" && httpStatusCode >= 500) {
      return true;
    }

    return false;
  }

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
   * Create a modified span with SAMPLED flag set.
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

    // Create a new object that inherits from span but overrides spanContext
    const sampledSpan = Object.create(span) as ReadableSpan;

    // Override spanContext method using Object.defineProperty
    Object.defineProperty(sampledSpan, "spanContext", {
      value: () => sampledContext,
      enumerable: true,
    });

    // Build new attributes with promotion marker + Vercel/DataDog resource attributes
    const newAttributes = {
      ...span.attributes,
      [TAIL_SAMPLING_PROMOTED_ATTR]: true,
      ...computeVercelResourceAttributes(span),
    };

    // Override attributes getter
    Object.defineProperty(sampledSpan, "attributes", {
      value: newAttributes,
      enumerable: true,
    });

    return sampledSpan;
  }
}
