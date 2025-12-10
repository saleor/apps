import { rootLogger } from "@saleor/apps-logger";

const logger = rootLogger.getSubLogger({ name: "TraceEffect" });

export const DEFAULT_SLOW_THRESHOLD_MS = 5000;

interface TraceEffectOptions {
  name: string;
  slowThresholdMs?: number;
}

/**
 * Creates a tracer function that wraps async operations with debug logging.
 * Logs start/finish and warns when operations exceed a configurable threshold.
 * Useful for tracing external calls (APIs, databases) to investigate timeouts.
 *
 * @example
 * const traceAlgolia = createTraceEffect({ name: "Algolia saveObjects", slowThresholdMs: 10000 });
 * await traceAlgolia(() => index.saveObjects(objects), { indexName, count: objects.length });
 */
export function createTraceEffect(options: TraceEffectOptions) {
  const { name, slowThresholdMs = DEFAULT_SLOW_THRESHOLD_MS } = options;

  return async function traceEffect<T>(
    operation: () => Promise<T>,
    attributes: Record<string, unknown> = {},
  ): Promise<T> {
    logger.debug(`Starting: ${name}`, attributes);
    const startTime = performance.now();

    try {
      const result = await operation();
      const durationMs = Math.round(performance.now() - startTime);

      if (durationMs > slowThresholdMs) {
        logger.warn(`Slow effect: ${name}`, { ...attributes, durationMs, slowThresholdMs });
      } else {
        logger.debug(`Finished: ${name}`, { ...attributes, durationMs });
      }

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);

      logger.error(`Effect failed: ${name}`, {
        ...attributes,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  };
}
