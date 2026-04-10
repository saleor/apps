import {
  createTraceEffect as createTraceEffectBase,
  type TraceEffectCallbacks,
  type TraceEffectOptions,
} from "@saleor/apps-otel/src/trace-effect";

import { createLogger } from "@/logger";

const logger = createLogger("TraceEffect");

const defaultCallbacks: TraceEffectCallbacks = {
  onStart: (name, ctx) => logger.debug(`Starting: ${name}`, ctx.attributes),
  onFinish: (name, ctx) => logger.debug(`Finished: ${name}`, ctx),
  onSlow: (name, ctx) => logger.warn(`Slow effect: ${name}`, ctx),
  onError: (name, ctx) => logger.error(`Effect failed: ${name}`, ctx),
};

export function createTraceEffect(options: Omit<TraceEffectOptions, "callbacks">) {
  return createTraceEffectBase({
    ...options,
    callbacks: defaultCallbacks,
  });
}
