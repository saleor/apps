import { Attributes, context, SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("trace-effect");

export const DEFAULT_SLOW_THRESHOLD_MS = 5000;

const TraceEffectAttributes = {
  DURATION_MS: "trace_effect.duration_ms",
  SLOW_THRESHOLD_MS: "trace_effect.slow_threshold_ms",
  IS_SLOW: "trace_effect.is_slow",
} as const;

export interface TraceEffectLogContext {
  attributes: Record<string, unknown>;
  durationMs?: number;
  slowThresholdMs?: number;
  error?: string;
}

export interface TraceEffectCallbacks {
  onStart?: (name: string, ctx: TraceEffectLogContext) => void;
  onFinish?: (name: string, ctx: TraceEffectLogContext) => void;
  onSlow?: (name: string, ctx: TraceEffectLogContext) => void;
  onError?: (name: string, ctx: TraceEffectLogContext) => void;
}

export interface TraceEffectOptions {
  name: string;
  slowThresholdMs?: number;
  callbacks?: TraceEffectCallbacks;
}

/**
 * Creates a tracer function that wraps async operations with OTEL spans.
 * Creates a span for each operation and optionally calls logging callbacks.
 * Useful for tracing external calls (APIs, databases) to investigate timeouts.
 *
 * @example
 * // Basic usage (spans only, no logging)
 * const traceAlgolia = createTraceEffect({ name: "Algolia saveObjects", slowThresholdMs: 10000 });
 * await traceAlgolia(() => index.saveObjects(objects), { indexName, count: objects.length });
 *
 * @example
 * // With logging callbacks
 * const traceAlgolia = createTraceEffect({
 *   name: "Algolia saveObjects",
 *   slowThresholdMs: 10000,
 *   callbacks: {
 *     onStart: (name, ctx) => logger.debug(`Starting: ${name}`, ctx.attributes),
 *     onFinish: (name, ctx) => logger.debug(`Finished: ${name}`, ctx),
 *     onSlow: (name, ctx) => logger.warn(`Slow: ${name}`, ctx),
 *     onError: (name, ctx) => logger.error(`Failed: ${name}`, ctx),
 *   },
 * });
 */
export function createTraceEffect(options: TraceEffectOptions) {
  const { name, slowThresholdMs = DEFAULT_SLOW_THRESHOLD_MS, callbacks } = options;

  return async function traceEffect<T>(
    operation: () => Promise<T>,
    attributes: Attributes = {},
  ): Promise<T> {
    const span = tracer.startSpan(name, { attributes }, context.active());

    callbacks?.onStart?.(name, { attributes });

    const startTime = performance.now();

    try {
      const result = await operation();
      const durationMs = Math.round(performance.now() - startTime);

      span.setAttribute(TraceEffectAttributes.DURATION_MS, durationMs);
      span.setAttribute(TraceEffectAttributes.SLOW_THRESHOLD_MS, slowThresholdMs);

      if (durationMs > slowThresholdMs) {
        span.setAttribute(TraceEffectAttributes.IS_SLOW, true);

        /*
         * TODO: In future we should set custom attribute only to mark span as slow
         * For now we'll mark it as error so that it's always sampled by collector and DataDog
         */
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `Operation exceeded slow threshold: ${durationMs}ms > ${slowThresholdMs}ms`,
        });
        callbacks?.onSlow?.(name, { attributes, durationMs, slowThresholdMs });
      } else {
        span.setAttribute(TraceEffectAttributes.IS_SLOW, false);
        span.setStatus({ code: SpanStatusCode.OK });
        callbacks?.onFinish?.(name, { attributes, durationMs });
      }

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);

      span.setAttribute(TraceEffectAttributes.DURATION_MS, durationMs);

      if (error instanceof Error) {
        span.recordException(error);
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });

      callbacks?.onError?.(name, {
        attributes,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    } finally {
      span.end();
    }
  };
}
