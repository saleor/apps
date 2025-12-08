import { ALGOLIA_TIMEOUT_MS } from "./algolia-timeouts";
import { createLogger } from "./logger";

const logger = createLogger("ExternalCall");

// Slow warning thresholds for different external call types
export const DYNAMODB_SLOW_THRESHOLD_MS = 1000;
export const ALGOLIA_SLOW_THRESHOLD_MS = ALGOLIA_TIMEOUT_MS * 2;
export const DEFAULT_SLOW_THRESHOLD_MS = 5000; // For Saleor calls & others

interface TraceOptions {
  name: string;
  attributes?: Record<string, unknown>;
  slowThresholdMs?: number;
}

/**
 * Wraps an async operation with debug logging for start/finish and warns when it exceeds a threshold.
 * Useful for tracing external calls (Algolia, Saleor GraphQL, DynamoDB) to investigate timeouts.
 */
export async function traceExternalCall<T>(
  operation: () => Promise<T>,
  options: TraceOptions,
): Promise<T> {
  const { name, attributes = {}, slowThresholdMs = DEFAULT_SLOW_THRESHOLD_MS } = options;

  logger.debug(`Starting: ${name}`, attributes);
  const startTime = performance.now();

  try {
    const result = await operation();
    const durationMs = Math.round(performance.now() - startTime);

    if (durationMs > slowThresholdMs) {
      logger.warn(`Slow external call: ${name}`, { ...attributes, durationMs, slowThresholdMs });
    } else {
      logger.debug(`Finished: ${name}`, { ...attributes, durationMs });
    }

    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);

    logger.error(`External call failed: ${name}`, {
      ...attributes,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
