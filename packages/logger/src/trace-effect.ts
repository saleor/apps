import {
  createTraceEffect as createTraceEffectBase,
  TraceEffectCallbacks,
  TraceEffectOptions,
} from "@saleor/apps-otel/trace-effect";

import { rootLogger } from "./root-logger";

const logger = rootLogger.getSubLogger({ name: "TraceEffect" });

const defaultCallbacks: TraceEffectCallbacks = {
  onStart: (name, ctx) => logger.debug(`Starting: ${name}`, ctx.attributes),
  onFinish: (name, ctx) => logger.debug(`Finished: ${name}`, ctx),
  onSlow: (name, ctx) => logger.warn(`Slow effect: ${name}`, ctx),
  onError: (name, ctx) => logger.error(`Effect failed: ${name}`, ctx),
};

/**
 * Creates a trace effect with logging enabled by default.
 * Wraps operations with OTEL spans and logs start/finish/slow/error events.
 *
 * @example
 * const traceAlgolia = createTraceEffect({ name: "Algolia saveObjects", slowThresholdMs: 10000 });
 * await traceAlgolia(() => index.saveObjects(objects), { indexName, count: objects.length });
 */
export function createTraceEffect(options: Omit<TraceEffectOptions, "callbacks">) {
  return createTraceEffectBase({
    ...options,
    callbacks: defaultCallbacks,
  });
}

// Re-export types for convenience
export type {
  TraceEffectCallbacks,
  TraceEffectLogContext,
  TraceEffectOptions,
} from "@saleor/apps-otel/trace-effect";
export { DEFAULT_SLOW_THRESHOLD_MS } from "@saleor/apps-otel/trace-effect";
